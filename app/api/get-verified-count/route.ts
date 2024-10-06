import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const GET = async () => {
    try {
        await connectToDatabase();
        const verifiedCount = await User.countDocuments({ isVerified: true });

        // Set cache-control headers to prevent caching
        return new NextResponse(JSON.stringify({ verifiedCount }), {
            headers: { "Cache-Control": "no-store, max-age=0" },
        });
    } catch (error) {
        console.error("Retrieval error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
