import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { CheckCircle} from "lucide-react";
import { defaultPlans } from "../../constants/plans";

interface PricingSectionProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PricingSection({
  title = "Planes diseñados para tu negocio",
  description = "Elige el plan que mejor se adapte a tus necesidades y comienza a optimizar tu negocio hoy",
  className = "py-24 bg-gray-50",
}: PricingSectionProps) {
  return (
    <section id="pricing" className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{description}</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {defaultPlans.map((plan) => (
            <div
              key={plan.planId}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 ${
                plan.isPopular ? "border-2 border-primary-500 relative" : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">/mes</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-primary-500 mr-3" />
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <Link to={`/onboarding?plan=${plan.planId}`}>
                  <Button
                    variant={plan.buttonVariant}
                    size="lg"
                    className="w-full"
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
