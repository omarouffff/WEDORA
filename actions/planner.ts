"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireActionCouple } from "@/lib/auth/guards";
import { parse, guarded, ok } from "@/lib/action";
import { z } from "zod/v4";
import { TASK_CATEGORIES } from "@/lib/constants";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(120),
  category: z.enum(TASK_CATEGORIES),
  dueDate: z.string().optional(),
});

export const addTask = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(taskSchema, data);
    if (!p.ok) return p.result;

    await prisma.weddingTask.create({
      data: {
        weddingId: wedding.id,
        title: p.data.title,
        category: p.data.category,
        dueDate: p.data.dueDate ? new Date(p.data.dueDate) : null,
        status: "TODO",
      },
    });
    revalidatePath("/dashboard/planner");
    return ok();
  });

const idSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
});

export const toggleTask = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(idSchema, data);
    if (!p.ok) return p.result;

    const task = await prisma.weddingTask.findFirst({
      where: { id: p.data.id, weddingId: wedding.id },
    });
    if (!task) return ok();
    
    await prisma.weddingTask.update({
      where: { id: p.data.id },
      data: { status: task.status === "DONE" ? "TODO" : "DONE" },
    });
    revalidatePath("/dashboard/planner");
    return ok();
  });

export const deleteTask = async (data: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(idSchema, data);
    if (!p.ok) return p.result;

    const task = await prisma.weddingTask.findFirst({
      where: { id: p.data.id, weddingId: wedding.id },
    });
    if (!task) return ok();

    await prisma.weddingTask.delete({
      where: { id: p.data.id },
    });
    revalidatePath("/dashboard/planner");
    return ok();
  });

export const updateTask = async (input: unknown) =>
  guarded(async () => {
    const { wedding } = await requireActionCouple();
    const p = parse(z.object({ id: z.string().uuid(), ...taskSchema.shape }), input);
    if (!p.ok) return p.result;
    const existing = await prisma.weddingTask.findFirst({ where: { id: p.data.id, weddingId: wedding.id }, select: { id: true } });
    if (!existing) return ok();
    await prisma.weddingTask.update({ where: { id: existing.id }, data: { title: p.data.title, category: p.data.category } });
    revalidatePath("/dashboard/planner");
    return ok();
  });
