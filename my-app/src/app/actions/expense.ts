
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";


const expenseSchema = z.object({
  id: z.string(),
  amount: z.coerce.number().int().positive("Amount must be a positive number"),
  description: z.string().min(1, "Description is required"),
  date: z.coerce.date({ invalid_type_error: "Date must be valid" }),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(), 
});


export async function createExpenseWithTag(formData: FormData) {
  const data = {
    amount: formData.get("amount")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    date: formData.get("date")?.toString() || "",
    categoryId: formData.get("categoryId")?.toString() || "",
    tags: formData.getAll("tags").map((t) => t.toString()), 
  };

  const parsed = expenseSchema.safeParse(data);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.expense.create({
      data: {
        amount: parsed.data.amount,
        description: parsed.data.description,
        date: parsed.data.date,
        categoryId: parsed.data.categoryId,
        tags: {
          connect: parsed.data.tags?.map((id) => ({ id })) || [],
        },
      },
    });

    revalidatePath("/dashboard/expense");
  } catch (error) {
      
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }
}


export async function updateExpense(formData: FormData) {
  const data = {
    id: formData.get("id")?.toString() || "",
    amount: formData.get("amount")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    date: formData.get("date")?.toString() || "",
    categoryId: formData.get("categoryId")?.toString() || "",
    tags: formData.getAll("tags").map((t) => t.toString()),
  };

  const parsed = expenseSchema.safeParse(data);

  if (!parsed.success || !parsed.data.id) {
    const errors = parsed.error?.errors.map((e) => e.message).join(", ") || "Expense ID is required";
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.expense.update({
      where: { id: parsed.data.id },
      data: {
        amount: parsed.data.amount,
        description: parsed.data.description,
        date: parsed.data.date,
        categoryId: parsed.data.categoryId,
        tags: {
          set: parsed.data.tags?.map((id) => ({ id })) || [],
        },
      },
    });

    revalidatePath("/dashboard/expense");
  } catch (error) {
    console.error("Error updating expense:", error);
    throw new Error("Failed to update expense");
  }
}


export async function deleteExpense(id: string) {
  if (!id) throw new Error("Expense ID is required");

  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard/expense");
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error("Failed to delete expense");
  }
}


export async function listAllExpenses() {
  try {
    return await prisma.expense.findMany({
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  } catch (error) {
    console.error("Error listing expenses:", error);
    throw new Error("Failed to load expenses");
  }
}

