// src/app/api/stats/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare/cloudflare-context';
import { NextRequest, NextResponse } from 'next/server';

interface StatsResponse {
  allTime: number;
  today: number;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {

    const { env } = getCloudflareContext(); 
    const KV = env.VISITOR_COUNT;

    if (!KV) {
      return NextResponse.json({ error: "KV Binding not found" }, { status: 500 });
    }

    const todayKey: string = `visits:${new Date().toISOString().split('T')[0]}`;
    const allTimeKey: string = 'visits:all_time';

    // 1. Fetch current values in parallel
    const [rawAllTime, rawToday]: [string | null, string | null] = await Promise.all([
      KV.get(allTimeKey),
      KV.get(todayKey)
    ]);

    const allTimeCount: number = (parseInt(rawAllTime || '0', 10)) + 1;
    const todayCount: number = (parseInt(rawToday || '0', 10)) + 1;

    // 2. Update both keys in parallel
    // We set an expiration (TTL) of 48 hours for the daily key to keep KV clean
    await Promise.all([
      KV.put(allTimeKey, allTimeCount.toString()),
      KV.put(todayKey, todayCount.toString(), { expirationTtl: 172800 })
    ]);

    const payload: StatsResponse = {
      allTime: allTimeCount,
      today: todayCount
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const msg: string = error instanceof Error ? error.message : 'Unknown stats error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}