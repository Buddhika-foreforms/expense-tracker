
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";



const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
});


export async function createNewCategory(formData: FormData) {

  const name = formData.get("name")?.toString().trim() ;

  const parsed = categorySchema.safeParse({ name });

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
      },
    });
         
    revalidatePath("/dashboard/category");
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(formData: FormData) {

  const id = formData.get("id")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";

  const parsed = categorySchema.safeParse({ id, name });

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id! },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/dashboard/category");
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}


export async function deleteCategory(id: string) {

  if (!id) throw new Error("Category ID is required");

  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/category");
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}


export async function listAllCategory() {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to load categories");
  }
}

