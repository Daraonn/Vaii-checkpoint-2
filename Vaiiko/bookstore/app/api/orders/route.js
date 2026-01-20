import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, orderData, cartItems } = body;

    
    const order = await prisma.order.create({
      data: {
        user_id: userId,
        fullName: orderData.fullName,
        email: orderData.email,
        phone: orderData.phone || null,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state || null,
        zipCode: orderData.zipCode,
        country: orderData.country || null,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        shippingMethod: orderData.shippingMethod,
        status: 'PENDING',
        items: {
          create: cartItems.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity,
            price: item.book.price
          }))
        }
      },
      include: {
        items: {
          include: {
            book: true
          }
        }
      }
    });

    // Clear user's cart after successful order
    await prisma.cartItem.deleteMany({
      where: {
        user_id: userId
      }
    });

    return Response.json({ 
      success: true, 
      order,
      message: 'Order placed successfully!' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create order' 
    }, { status: 500 });
  }
}

export async function GET(request) {
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const orders = await prisma.order.findMany({
      where: userId ? { user_id: parseInt(userId) } : {},
      include: {
        items: {
          include: {
            book: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}