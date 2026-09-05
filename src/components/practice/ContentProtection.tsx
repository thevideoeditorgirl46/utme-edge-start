import { useEffect } from "react";
import { toast } from "sonner";

interface ContentProtectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ContentProtection
 * Restricts casual copying, text highlighting, right-clicking,
 * printing, and screenshot shortcuts on practice exam content
 * while leaving form inputs (like student notes) fully editable.
 */
export function ContentProtection({ children, className = "" }: ContentProtectionProps) {
  useEffect(() => {
    function isInputElement(target: EventTarget | null): boolean {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        target.isContentEditable ||
        target.closest("input") !== null ||
        target.closest("textarea") !== null
      );
    }

    // 1. Prevent Right-Click (Context Menu)
    function handleContextMenu(e: MouseEvent) {
      if (isInputElement(e.target)) return;
      e.preventDefault();
      toast.info("Right-click is disabled to protect practice question content.", {
        duration: 2000,
      });
    }

    // 2. Prevent Copy & Cut events on question text
    function handleCopy(e: ClipboardEvent) {
      if (isInputElement(e.target)) return;
      e.preventDefault();
      toast.error("Copying question content is disabled. Use 'Ask AI' for instant explanations.", {
        duration: 2500,
      });
    }

    function handleCut(e: ClipboardEvent) {
      if (isInputElement(e.target)) return;
      e.preventDefault();
    }

    // 3. Prevent Drag & Drop of text/images
    function handleDragStart(e: DragEvent) {
      if (isInputElement(e.target)) return;
      e.preventDefault();
    }

    // 4. Intercept Keyboard Shortcuts (Ctrl+C, Cmd+C, Ctrl+P, Cmd+P, PrintScreen)
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputElement(e.target)) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Block Ctrl+C / Cmd+C on question content
      if (isCmdOrCtrl && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        toast.error("Copying questions is disabled. Click 'Ask AI' instead.", {
          duration: 2500,
        });
        return;
      }

      // Block Ctrl+P / Cmd+P (Print to PDF / Printer)
      if (isCmdOrCtrl && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        toast.error("Printing practice questions is restricted.", { duration: 2500 });
        return;
      }

      // Detect PrintScreen
      if (e.key === "PrintScreen") {
        toast.warning("Screenshots of practice questions are restricted.", { duration: 3000 });
        // Attempt to clear clipboard buffer if supported
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch {
          // ignore
        }
      }
    }

    // 5. Detect PrintScreen keyup as well
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "PrintScreen") {
        toast.warning("Screenshots of practice questions are restricted.", { duration: 3000 });
        try {
          navigator.clipboard.writeText("").catch(() => {});
        } catch {
          // ignore
        }
      }
    }

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      className={`protected-practice-content select-none ${className}`}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {children}
    </div>
  );
}
