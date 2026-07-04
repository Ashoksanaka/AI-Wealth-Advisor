import { seedAllDemoData } from "@/actions/seed";
import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";

export async function POST(request) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_SEED !== "true"
  ) {
    return Response.json(
      { success: false, error: "Demo seed is disabled in production" },
      { status: 403 }
    );
  }

  const { error } = await getApiUser();
  if (error) return error;

  let persona = "sarah";
  try {
    const body = await request.json();
    if (body?.persona === "raj" || body?.persona === "sarah") {
      persona = body.persona;
    }
  } catch {
    // default persona
  }

  const result = await seedAllDemoData(persona);
  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }
  return apiSuccess({ message: result.message });
}
