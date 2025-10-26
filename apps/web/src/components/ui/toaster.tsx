import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      invert
      toastOptions={{
        classNames: {
          toast:
            "border border-white/10 bg-slate-900/80 text-slate-100 backdrop-blur",
          description: "text-slate-300",
          actionButton:
            "inline-flex h-8 items-center rounded-md border border-white/10 bg-transparent px-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          closeButton:
            "absolute right-2 top-2 rounded-md p-1 text-slate-300 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        },
      }}
      {...props}
    />
  );
}
