import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const orgId = req.user!.orgId;
    const budgets = await prisma.budget.findMany({
      where: { orgId, month: now.getMonth() + 1, year: now.getFullYear() }
    });

    // Calculate spent per category this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const invoices = await prisma.invoice.findMany({
      where: { orgId, invoiceDate: { gte: startOfMonth } }
    });
    const spent: Record<string, number> = {};
    invoices.forEach(i => { spent[i.category] = (spent[i.category] || 0) + i.totalAmount; });

    const result = budgets.map(b => ({
      ...b,
      spent: spent[b.category] || 0,
      percentage: Math.round(((spent[b.category] || 0) / b.monthlyLimit) * 100)
    }));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const { category, monthlyLimit } = req.body;
    const budget = await prisma.budget.upsert({
      where: {
        orgId_category_month_year: {
          orgId: req.user!.orgId, category,
          month: now.getMonth() + 1, year: now.getFullYear()
        }
      },
      update: { monthlyLimit: parseFloat(monthlyLimit) },
      create: {
        orgId: req.user!.orgId, category,
        monthlyLimit: parseFloat(monthlyLimit),
        month: now.getMonth() + 1, year: now.getFullYear()
      }
    });
    res.json(budget);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
