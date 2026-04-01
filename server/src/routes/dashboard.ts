import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.orgId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allInvoices = await prisma.invoice.findMany({ where: { orgId } });

    const totalSpend = allInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const thisMonth = allInvoices
      .filter(i => i.invoiceDate >= startOfMonth)
      .reduce((s, i) => s + i.totalAmount, 0);
    const pending = allInvoices.filter(i => i.status === 'unpaid').length;
    const overdue = allInvoices.filter(i =>
      i.status === 'unpaid' && i.dueDate && i.dueDate < now
    ).length;

    // Monthly trend (last 6 months)
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const amount = allInvoices
        .filter(inv => inv.invoiceDate >= d && inv.invoiceDate <= end)
        .reduce((s, inv) => s + inv.totalAmount, 0);
      months.push({ month: label, amount });
    }

    // By category
    const byCategory: Record<string, number> = {};
    allInvoices.forEach(i => {
      byCategory[i.category] = (byCategory[i.category] || 0) + i.totalAmount;
    });
    const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    res.json({ totalSpend, thisMonth, pending, overdue, monthlyTrend: months, categoryData });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
