import { ReactNode, StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import LoginPage from "./LoginPage";
import {
  ConvexReactClient,
  Authenticated,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { api } from "../convex/_generated/api";
import SigningUpPage from "./SigningUp";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function WaitForClerkUserData(props: {
  children: JSX.Element;
  loading: JSX.Element;
}) {
  const [loginStatus, user] = useQuery(api.users.userLoginStatus) || [
    "Loading",
    null,
  ];

  // used for the side effect of keeping the current user loaded
  useQuery(api.users.currentUser);
  if (loginStatus !== "Logged In") {
    return props.loading; // waiting for user row
  }
  return props.children;
}

ReactDOM.render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Authenticated is for having a JWT token from Clerk */}
        <Authenticated>
          {/* WaitForClerkUserData is for Clerk data from a webhook */}
          <WaitForClerkUserData loading={<SigningUpPage />}>
            <App />
          </WaitForClerkUserData>
        </Authenticated>
        <Unauthenticated>
          <LoginPage />
        </Unauthenticated>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
  document.getElementById("root")
);
