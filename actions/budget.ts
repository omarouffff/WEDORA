"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok } from "@/lib/action";
import { z } from "zod/v4";

const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().min(0.01),
  note: z.string().optional(),
});

export const addExpense = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(expenseSchema, data);
    if (!p.ok) return p.result;

    let budget = await prisma.weddingBudget.findUnique({
      where: { weddingId: wedding.id }
    });
    
    if (!budget) {
      budget = await prisma.weddingBudget.create({
        data: { weddingId: wedding.id, total: 250000 }
      });
    }

    let budgetCategory = await prisma.budgetCategory.findFirst({
      where: { budgetId: budget.id, name: p.data.category }
    });
    
    if (!budgetCategory) {
      budgetCategory = await prisma.budgetCategory.create({
        data: { budgetId: budget.id, name: p.data.category }
      });
    }

    await prisma.budgetTransaction.create({
      data: {
        budgetId: budget.id,
        categoryId: budgetCategory.id,
        title: p.data.category,
        amount: p.data.amount,
        note: p.data.note,
      }
    });

    revalidatePath("/dashboard/budget");
    return ok();
  });

const idSchema = z.object({ id: z.string() });

export const deleteExpense = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(idSchema, data);
    if (!p.ok) return p.result;
    
    const budget = await prisma.weddingBudget.findUnique({
      where: { weddingId: wedding.id }
    });
    if (!budget) throw new Error("Budget not found");

    const transaction = await prisma.budgetTransaction.findFirst({
      where: { id: p.data.id, budgetId: budget.id }
    });
    if (!transaction) throw new Error("Transaction not found");

    await prisma.budgetTransaction.delete({
      where: { id: p.data.id }
    });

    revalidatePath("/dashboard/budget");
    return ok();
  });

const totalSchema = z.object({ total: z.number().min(0) });

export const updateBudgetTotal = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(totalSchema, data);
    if (!p.ok) return p.result;
    
    const budget = await prisma.weddingBudget.findUnique({
      where: { weddingId: wedding.id }
    });
    
    if (budget) {
      await prisma.weddingBudget.update({
        where: { id: budget.id },
        data: { total: p.data.total }
      });
    } else {
      await prisma.weddingBudget.create({
        data: { weddingId: wedding.id, total: p.data.total }
      });
    }
    
    revalidatePath("/dashboard/budget");
    return ok();
  });
