
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;


export async function PUT(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const alertId = Number(resolvedParams.alertId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { alert_id: alertId }
    });

    if (!alert) {
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (alert.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.alert.update({
      where: { alert_id: alertId },
      data: { is_read: true }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error marking alert as read:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to mark alert as read' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function DELETE(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const alertId = Number(resolvedParams.alertId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const alert = await prisma.alert.findUnique({
      where: { alert_id: alertId }
    });

    if (!alert) {
      return new Response(
        JSON.stringify({ error: 'Alert not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (alert.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.alert.delete({
      where: { alert_id: alertId }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error deleting alert:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete alert' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}