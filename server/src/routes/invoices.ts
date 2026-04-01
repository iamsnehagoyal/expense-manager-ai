import { Router, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/invoices/upload - AI extraction
router.post('/upload', upload.single('invoice'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = req.file.path;
    const imageData = fs.readFileSync(filePath);
    const base64 = imageData.toString('base64');
    const mimeType = req.file.mimetype as 'image/jpeg' | 'image/png';

    const prompt = `You are an invoice parser. Extract the following fields from this invoice image and return ONLY a valid JSON object with no extra text:
{
  "vendorName": "string",
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD or null",
  "totalAmount": number,
  "currency": "INR or USD or EUR etc",
  "category": "one of: Food, Travel, Software, Office, Marketing, Utilities, Other",
  "confidence": number between 0 and 1,
  "lineItems": [
    { "description": "string", "quantity": number, "unitPrice": number, "totalPrice": number }
  ]
}
If you cannot read a field clearly, make your best guess and lower the confidence score. Always return valid JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text', text: prompt }
        ]
      }]
    });

    fs.unlinkSync(filePath);

    const raw = response.choices[0].message.content || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(cleaned);

    res.json({ extracted, raw: cleaned });
  } catch (err: any) {
    res.status(500).json({ message: 'AI extraction failed: ' + err.message });
  }
});

// POST /api/invoices - save invoice
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { vendorName, invoiceDate, dueDate, totalAmount, currency, category, status, confidence, rawText, lineItems } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        orgId: req.user!.orgId,
        vendorName,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        totalAmount: parseFloat(totalAmount),
        currency: currency || 'INR',
        category,
        status: status || 'unpaid',
        confidence,
        rawText,
        lineItems: lineItems?.length
          ? { create: lineItems.map((li: any) => ({ description: li.description, quantity: li.quantity, unitPrice: li.unitPrice, totalPrice: li.totalPrice })) }
          : undefined
      },
      include: { lineItems: true }
    });
    res.json(invoice);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/invoices
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, dateFrom, dateTo, search } = req.query;
    const where: any = { orgId: req.user!.orgId };
    if (category) where.category = category;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = new Date(dateFrom as string);
      if (dateTo) where.invoiceDate.lte = new Date(dateTo as string);
    }
    if (search) where.vendorName = { contains: search };

    const invoices = await prisma.invoice.findMany({
      where,
      include: { lineItems: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices/export/csv
router.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ where: { orgId: req.user!.orgId } });
    const headers = ['ID', 'Vendor', 'Date', 'Due Date', 'Amount', 'Currency', 'Category', 'Status'];
    const rows = invoices.map(i => [
      i.id, i.vendorName,
      i.invoiceDate.toISOString().split('T')[0],
      i.dueDate ? i.dueDate.toISOString().split('T')[0] : '',
      i.totalAmount, i.currency, i.category, i.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/invoices/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: parseInt(req.params.id), orgId: req.user!.orgId },
      include: { lineItems: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Not found' });
    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/invoices/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { vendorName, invoiceDate, dueDate, totalAmount, currency, category, status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(req.params.id) },
      data: {
        vendorName, category, status, currency,
        totalAmount: parseFloat(totalAmount),
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });
    res.json(invoice);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.invoice.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
