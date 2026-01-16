export async function POST() {
  // Build secure cookie deletion string
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    'token=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
    isProduction ? 'Secure' : '',
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