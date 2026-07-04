import { SignIn } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

const clerkAppearance = {
  variables: {
    colorPrimary: "#34D399",
    colorBackground: "#0C1018",
    colorText: "#E8EDF4",
    colorInputBackground: "#151B24",
    colorInputText: "#E8EDF4",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "bg-transparent shadow-none border-0 p-0",
    headerTitle: "text-foreground font-display font-semibold hidden",
    headerSubtitle: "text-muted-foreground hidden",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    footerActionLink: "text-primary hover:text-primary/80",
    formFieldInput: "bg-input border-border",
  },
};

const Page = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="icon-ring mx-auto h-12 w-12">
          <LogIn className="h-5 w-5" />
        </div>
        <h1 className="display-title text-xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your finances
        </p>
      </div>
      <SignIn appearance={clerkAppearance} />
    </div>
  );
};

export default Page;
