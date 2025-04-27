import { getIndustryInsights } from "@/actions/dashboard";
import {getUserOnboardingStatus} from "@/actions/user";
import DashboardView from "./_component/dashboard-view";
import { redirect } from "next/navigation";

const IndustryInsightsPage = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();
  const insights = await getIndustryInsights();
  if(!isOnboarded) {
    redirect("/onboarding");
  }
  return(
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}

export default IndustryInsightsPage;