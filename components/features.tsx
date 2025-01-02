import { Shield, Clock, Scale } from "lucide-react";

const features = [
  {
    name: "Secure Storage",
    description:
      "Your belongings are protected with 24/7 surveillance and advanced security systems.",
    icon: Shield,
  },
  {
    name: "Flexible Access",
    description:
      "Access your luggage whenever you need, with extended hours and easy check-in/check-out.",
    icon: Clock,
  },
  {
    name: "Weight-based Pricing",
    description:
      "Choose from small (up to 10 kg), medium (up to 15 kg), or large (up to 20 kg) storage options.",
    icon: Scale,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to store your luggage
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our monthly luggage storage service offers convenience, security,
            and flexibility for all your storage needs.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
