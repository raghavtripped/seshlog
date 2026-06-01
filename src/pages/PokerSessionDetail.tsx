// Session detail: summary, end/cash-out quick action, edit form, buy-ins,
// key hands, and reflection.

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2, Flag } from "lucide-react";
import { toast } from "sonner";
import { PokerLayout } from "@/features/poker/components/PokerLayout";
import { SessionForm } from "@/features/poker/components/SessionForm";
import { BuyInList } from "@/features/poker/components/BuyInList";
import { KeyHandList } from "@/features/poker/components/KeyHandList";
import { ReflectionForm } from "@/features/poker/components/ReflectionForm";
import { useSession } from "@/features/poker/api/usePokerSessions";
import { useBuyIns } from "@/features/poker/api/useBuyIns";
import { usePokerProfile } from "@/features/poker/api/usePokerProfile";
import {
  netNative,
  netBase,
  bbWon,
  sessionDurationMinutes,
  durationHours,
  bbPer100,
} from "@/features/poker/lib/metrics";
import { formatMoney, formatBB } from "@/features/poker/lib/currencies";

const PokerSessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, isLoading, updateSession, deleteSession, refetch } = useSession(id);
  const { total: buyInTotal, refetch: refetchBuyIns } = useBuyIns(id);
  const { baseCurrency } = usePokerProfile();

  const [editing, setEditing] = useState(false);
  const [cashOut, setCashOut] = useState("");
  const [estHands, setEstHands] = useState("");
  const [ending, setEnding] = useState(false);

  const isLive = session ? !session.ended_at && session.cash_out === null : false;

  const summary = useMemo(() => {
    if (!session || session.cash_out === null) return null;
    const net = netNative(Number(session.cash_out), buyInTotal);
    const nb = netBase(net, Number(session.fx_rate_to_base));
    const bb = bbWon(net, Number(session.big_blind));
    const mins = sessionDurationMinutes(session.started_at, session.ended_at);
    const hours = mins === null ? null : durationHours(mins);
    const per100 =
      bb !== null && session.est_hands ? bbPer100(bb, session.est_hands) : null;
    return { net, nb, bb, hours, per100 };
  }, [session, buyInTotal]);

  const endSession = async () => {
    if (!session) return;
    if (cashOut === "") {
      toast.error("Enter your cash-out amount.");
      return;
    }
    setEnding(true);
    try {
      await updateSession({
        cash_out: Number(cashOut),
        est_hands: estHands === "" ? null : Math.round(Number(estHands)),
        ended_at: session.ended_at ?? new Date().toISOString(),
      });
      toast.success("Session ended");
      refetchBuyIns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to end session");
    } finally {
      setEnding(false);
    }
  };

  const remove = async () => {
    try {
      await deleteSession();
      toast.success("Session deleted");
      navigate("/poker/sessions");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <PokerLayout title="Session">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </PokerLayout>
    );
  }

  if (!session) {
    return (
      <PokerLayout title="Session">
        <p className="text-sm text-gray-500">Session not found.</p>
      </PokerLayout>
    );
  }

  return (
    <PokerLayout
      title={session.venue || "Session"}
      subtitle={`${session.small_blind}/${session.big_blind} ${session.currency} · ${session.session_type} · ${session.game_type}`}
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
            <Pencil className="mr-1 h-4 w-4" /> {editing ? "Close" : "Edit"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This also removes its buy-ins and key hands. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={remove} className="bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      {/* Summary */}
      <Card className="border-none bg-white/80 shadow-sm">
        <CardContent className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          <Stat label="Buy-in" value={formatMoney(buyInTotal, session.currency)} />
          <Stat
            label="Cash out"
            value={session.cash_out === null ? "—" : formatMoney(Number(session.cash_out), session.currency)}
          />
          <Stat
            label={`Net (${baseCurrency})`}
            value={summary ? formatMoney(summary.nb, baseCurrency, { signed: true }) : "—"}
            tone={summary ? (summary.nb >= 0 ? "pos" : "neg") : undefined}
          />
          <Stat label="BB won" value={summary?.bb != null ? formatBB(summary.bb) : "—"} />
          <Stat label="Hours" value={summary?.hours != null ? summary.hours.toFixed(1) : "—"} />
          <Stat label="BB/100" value={summary?.per100 != null ? summary.per100.toFixed(1) : "—"} />
          <Stat label="Est. hands" value={session.est_hands?.toString() ?? "—"} />
          <Stat label="FX → base" value={String(session.fx_rate_to_base)} />
        </CardContent>
      </Card>

      {/* End / cash out (live only) */}
      {isLive && (
        <Card className="border-none bg-emerald-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-emerald-800">
              <Flag className="h-4 w-4" /> Cash out / End session
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Cash out ({session.currency})</Label>
              <Input type="number" step="any" value={cashOut} onChange={(e) => setCashOut(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Est. hands</Label>
              <Input type="number" value={estHands} onChange={(e) => setEstHands(e.target.value)} />
            </div>
            <Button onClick={endSession} disabled={ending} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              {ending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              End session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      {editing && (
        <Card className="border-none bg-white/80 shadow-sm">
          <CardContent className="p-4">
            <SessionForm
              mode="edit"
              baseCurrency={baseCurrency}
              defaultCurrency={session.currency}
              existing={session}
              onUpdate={async (patch) => {
                await updateSession(patch);
                setEditing(false);
              }}
              onDone={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      )}

      <BuyInList sessionId={session.id} currency={session.currency} onChange={refetch} />
      <KeyHandList sessionId={session.id} currency={session.currency} />
      <ReflectionForm
        session={session}
        onSave={async (patch) => {
          await updateSession(patch);
        }}
      />
    </PokerLayout>
  );
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-semibold ${tone === "pos" ? "text-emerald-600" : tone === "neg" ? "text-red-600" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}

export default PokerSessionDetail;
