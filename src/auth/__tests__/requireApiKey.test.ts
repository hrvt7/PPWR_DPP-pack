import { describe, expect, it } from "vitest";
import { ApiKeyError, requireApiKey } from "../requireApiKey";

describe("requireApiKey", () => {
  it("returns shop when API key is valid", async () => {
    const request = new Request("http://localhost", {
      headers: { "x-api-key": "cpk_live_test" }
    });
    const shop = await requireApiKey(request, async () => ({
      id: "shop_1",
      merchant_id: "merchant_1",
      status: "active",
      api_key: "cpk_live_test"
    }));
    expect(shop.id).toBe("shop_1");
  });

  it("throws 401 when API key missing", async () => {
    const request = new Request("http://localhost");
    await expect(requireApiKey(request, async () => null)).rejects.toMatchObject({
      status: 401
    });
  });

  it("throws 403 when API key invalid", async () => {
    const request = new Request("http://localhost", {
      headers: { "x-api-key": "bad" }
    });
    try {
      await requireApiKey(request, async () => null);
      throw new Error("expected error");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiKeyError);
      expect((error as ApiKeyError).status).toBe(403);
    }
  });
});
