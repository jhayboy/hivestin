import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { Parser } from 'json2csv';
import { format } from 'date-fns';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query = { userId: session.user.id };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const fields = ['type', 'amount', 'status', 'createdAt'];
      const parser = new Parser({ fields });
      const csv = parser.parse(transactions.map(t => ({
        ...t.toObject(),
        createdAt: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm:ss')
      })));

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
        }
      });
    }

    // PDF format
    const pdf = await generateTransactionPDF(transactions);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=transactions-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      }
    });
  } catch (error) {
    console.error('Transaction export error:', error);
    return NextResponse.json(
      { message: 'Failed to export transactions' },
      { status: 500 }
    );
  }
} 