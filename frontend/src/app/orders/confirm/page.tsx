import { Suspense } from "react";
import ConfirmOrderContent from "./ConfirmOrderContent";

export default function ConfirmOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang xử lý...
        </div>
      }
    >
      <ConfirmOrderContent />
    </Suspense>
  );
}
