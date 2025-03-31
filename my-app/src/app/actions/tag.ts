

"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";


// Zod validation schema

const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Tag name is required"),
});


export async function createNewtag(formData: FormData) {
  const name = formData.get("name")?.toString().trim() || "";

  const parsed = tagSchema.safeParse({ name });

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.tag.create({
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/dashboard/tag");
  } catch (error) {
    console.error("Error creating tag:", error);
    throw new Error("Failed to create tag");
  }
}


export async function updateTagDetails(formData: FormData) {
  const id = formData.get("id")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";

  const parsed = tagSchema.safeParse({ id, name });

  if (!parsed.success || !parsed.data.id) {
    const errors = parsed.error?.errors.map((e) => e.message).join(", ") || "Tag ID is required";
    throw new Error(`Validation failed: ${errors}`);
  }

  try {
    await prisma.tag.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/dashboard/tag");
  } catch (error) {
    console.error("Error updating tag:", error);
    throw new Error("Failed to update tag");
  }
}


export async function deleteTag(id: string) {
  if (!id) throw new Error("Tag ID is required");

  try {
    await prisma.tag.delete({
      where: { id },
    });

    revalidatePath("/dashboard/tag");
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Failed to delete tag");
  }
}


export async function listAllTags() {
  try {
    return await prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error loading tags:", error);
    throw new Error("Failed to load tags");
  }
}
