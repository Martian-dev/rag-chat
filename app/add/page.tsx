"use client";

// import { createResource } from "@/lib/actions/resources";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { useRef } from "react";

export default function AddContext() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <div className="flex justify-center items-center h-full">
      <form
        ref={formRef}
        action={async (formData: FormData) => {
          const content = formData.get("context");
          if (!content || typeof content !== "string")
            return { error: "context is required." };
          try {
            // await createResource({ content });
          } catch (e) {
            console.log("[ADDING CONTEXT ERROR] ", e);
          }
          formRef.current?.reset();
        }}
      >
        <textarea name="context" className="border-2 border-s-black" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
