export async function POST() {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    'token=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
    'Secure',
  ].filter(Boolean).join('; ');

  return new Response(
    JSON.stringify({ success: true }), 
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions,
      },
    }
  );
}