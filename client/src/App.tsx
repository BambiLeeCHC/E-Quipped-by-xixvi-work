import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import CourseCatalog from "./pages/CourseCatalog";
import CourseDetail from "./pages/CourseDetail";
import LessonViewer from "./pages/LessonViewer";
import AISandbox from "./pages/AISandbox";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import LessonEditor from "./pages/LessonEditor";
import AdminUsers from "./pages/AdminUsers";
import Pricing from "./pages/Pricing";
import PaymentHistory from "./pages/PaymentHistory";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import RefundPolicy from "./pages/policies/RefundPolicy";
import CookiePolicy from "./pages/policies/CookiePolicy";
import AccessibilityStatement from "./pages/policies/AccessibilityStatement";
import FloatingSandbox from "./components/FloatingSandbox";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/courses" component={CourseCatalog} />
      <Route path="/courses/:slug" component={CourseDetail} />
      <Route path="/lessons/:slug" component={LessonViewer} />
      <Route path="/sandbox" component={AISandbox} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/editor" component={EditorDashboard} />
      <Route path="/editor/lessons/:lessonId" component={LessonEditor} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payments" component={PaymentHistory} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/refund" component={RefundPolicy} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/accessibility" component={AccessibilityStatement} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalWidgets() {
  const [location] = useLocation();
  // Don't render the floating sandbox on the /sandbox page itself
  if (location === "/sandbox") return null;
  return <FloatingSandbox />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {/*
            #app-layout-root wraps all page content.
            FloatingSandbox applies margin-right to this element (not body padding-right)
            so that fixed/sticky headers shift together with the rest of the page
            when the sandbox drawer opens on desktop.
          */}
          <div id="app-layout-root" style={{ position: "relative", minHeight: "100vh" }}>
            <Router />
          </div>
          <GlobalWidgets />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
