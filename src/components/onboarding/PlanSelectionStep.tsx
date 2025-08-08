import { Star, CheckCircle, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import Button from "../ui/Button";
import { defaultPlans, PricingPlan } from "../landing/PricingSection";

interface PlanSelectionStepProps {
  form: UseFormReturn<{ selectedPlan: string }>;
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  onNext: () => void;
}

export function PlanSelectionStep({
  form,
  selectedPlan,
  setSelectedPlan,
  onNext,
}: PlanSelectionStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Star className="h-6 w-6 text-yellow-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Elige tu Plan</h2>
        <p className="mt-2 text-gray-600">
          Selecciona el plan que mejor se adapte a las necesidades de tu negocio
        </p>


        <div className="mt-2 inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 text-xs font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
            Paga solo cuando se termine tu prueba
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit((data) => {
          setSelectedPlan(data.selectedPlan);
          onNext();
        })}
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {defaultPlans.map((plan: PricingPlan) => (
            <div
              key={plan.planId}
              className={`relative rounded-lg border p-6 cursor-pointer hover:border-primary-500 transition-colors ${
                selectedPlan === plan.planId
                  ? "border-primary-500 ring-2 ring-primary-500"
                  : "border-gray-300"
              }`}
              onClick={() => {
                form.setValue("selectedPlan", plan.planId, { shouldValidate: true });
                setSelectedPlan(plan.planId);
                // Avanzar automáticamente al siguiente paso
                onNext();
              }}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                  Popular
                </div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                {selectedPlan === plan.planId && (
                  <CheckCircle className="h-5 w-5 text-primary-500" />
                )}
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-base font-medium text-gray-500">/mes</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plan.features.map((feature: { text: string }, index: number) => (
                  <li key={`${plan.planId}-feature-${index}`} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={!selectedPlan}>
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}
