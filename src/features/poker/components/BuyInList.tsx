// Buy-in timeline editor for a session (initial + re-buys / top-ups / add-ons).

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBuyIns } from "../api/useBuyIns";
import { formatMoney } from "../lib/currencies";
import { BUYIN_KINDS, type BuyInKind } from "../lib/types";

interface BuyInListProps {
  sessionId: string;
  currency: string;
  onChange?: () => void;
}

export function BuyInList({ sessionId, currency, onChange }: BuyInListProps) {
  const { buyIns, total, addBuyIn, deleteBuyIn } = useBuyIns(sessionId);
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<BuyInKind>("rebuy");

  const add = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter an amount.");
      return;
    }
    try {
      await addBuyIn(Number(amount), kind);
      setAmount("");
      onChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add buy-in");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteBuyIn(id);
      onChange?.();
    } catch {
      toast.error("Failed to delete buy-in");
    }
  };

  return (
    <Card className="border-none bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Buy-ins</CardTitle>
        <span className="text-sm font-semibold text-gray-700">
          Total: {formatMoney(total, currency)}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5">
          {buyIns.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium capitalize text-emerald-700">
                  {b.kind}
                </span>
                {formatMoney(Number(b.amount), currency)}
              </span>
              <button onClick={() => remove(b.id)} className="text-gray-300 hover:text-red-500" aria-label="Delete buy-in">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {buyIns.length === 0 && <li className="text-sm text-gray-400">No buy-ins yet.</li>}
        </ul>

        <div className="flex gap-2">
          <Input
            type="number"
            step="any"
            placeholder={`Amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />
          <Select value={kind} onValueChange={(v) => setKind(v as BuyInKind)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUYIN_KINDS.map((k) => (
                <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} size="icon" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BuyInList;
