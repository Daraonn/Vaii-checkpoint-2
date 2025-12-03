const { PrismaClient } = require('@prisma/client');
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const bannedChars = /['";\\]/;

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      return new Response(JSON.stringify({ error: 'Neplatný JSON.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, password, username } = body;

    if (!email || !password || !username) {
      return new Response(
        JSON.stringify({ error: 'Email, username a heslo sú povinné.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (username.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Používateľské meno musí mať aspoň 3 znaky.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (bannedChars.test(username) || bannedChars.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Používateľské meno alebo email obsahuje nepovolené znaky.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let existingEmail = null;
    let existingName = null;

    try {
      existingEmail = await prisma.user.findUnique({ where: { email } });
      existingName = await prisma.user.findUnique({ where: { name: username } });
      console.log('Existing email:', existingEmail);
      console.log('Existing username:', existingName);
    } catch (err) {
      console.error('Prisma query failed:', err);
      return new Response(JSON.stringify({ error: 'Chyba databázy.' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: 'Používateľ s týmto e-mailom už existuje.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingName) {
      return new Response(
        JSON.stringify({ error: 'Používateľ s týmto používateľským menom už existuje.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');
    } catch (err) {
      console.error('Password hashing failed:', err);
      return new Response(JSON.stringify({ error: 'Chyba pri spracovaní hesla.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let user;
    try {
      user = await prisma.user.create({
        data: { email, password: hashedPassword, name: username },
      });
      console.log('User created:', user);
    } catch (err) {
      console.error('Failed to create user:', err);
      return new Response(JSON.stringify({ error: 'Chyba pri vytváraní používateľa.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ message: 'User registered successfully.', userId: user.user_id }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected server error:', err);
    return new Response(JSON.stringify({ error: 'Neočakávaná chyba servera.' }), {
      status: 504,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
