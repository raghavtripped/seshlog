import { describe, it, expect } from "vitest";
import { buildSessionUpdatePayload } from "./sessionUpdatePayload";

describe("buildSessionUpdatePayload", () => {
  it("drops user_id so the update never rewrites row ownership", () => {
    const payload = buildSessionUpdatePayload({
      user_id: "",
      session_type: "Regular",
      quantity: 5,
    });

    expect(payload).not.toHaveProperty("user_id");
    expect(payload.session_type).toBe("Regular");
    expect(payload.quantity).toBe(5);
  });

  it("drops a non-empty user_id too, not just the empty sentinel", () => {
    const payload = buildSessionUpdatePayload({
      user_id: "some-other-user",
      quantity: 2,
    });

    expect(payload).not.toHaveProperty("user_id");
  });

  it("drops server-managed identity and timestamp columns", () => {
    const payload = buildSessionUpdatePayload({
      id: "abc",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      quantity: 3,
    });

    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("created_at");
    expect(payload).not.toHaveProperty("updated_at");
    expect(payload.quantity).toBe(3);
  });

  it("normalizes session_date to an ISO string", () => {
    const payload = buildSessionUpdatePayload({
      session_date: "2026-08-09T01:00",
    });

    expect(payload.session_date).toBe(new Date("2026-08-09T01:00").toISOString());
  });

  it("leaves session_date absent when it was not being edited", () => {
    const payload = buildSessionUpdatePayload({ quantity: 1 });

    expect(payload).not.toHaveProperty("session_date");
  });

  it("preserves the editable fields the form actually submits", () => {
    const payload = buildSessionUpdatePayload({
      user_id: "",
      category: "cigs",
      session_type: "Regular",
      quantity: 5,
      participant_count: 2,
      is_social: true,
      notes: "mitron andheri",
      rating: 3,
    });

    expect(payload).toEqual({
      category: "cigs",
      session_type: "Regular",
      quantity: 5,
      participant_count: 2,
      is_social: true,
      notes: "mitron andheri",
      rating: 3,
    });
  });
});
