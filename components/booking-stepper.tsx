"use client"

import { useState } from "react"
import { Check, Luggage, CreditCard, ClipboardCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const steps = [
  {
    id: 1,
    name: "Luggage Info",
    icon: Luggage,
  },
  {
    id: 2,
    name: "Price Info",
    icon: CreditCard,
  },
  {
    id: 3,
    name: "Review & Pay",
    icon: ClipboardCheck,
  },
]

export default function LuggageBooking() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background",
                  currentStep > step.id && "bg-primary",
                  currentStep === step.id && "border-primary",
                )}
              >
                {currentStep > step.id ? (
                  <Check className={cn("h-6 w-6", currentStep > step.id && "text-primary-foreground")} />
                ) : (
                  <step.icon className={cn("h-6 w-6", currentStep === step.id && "text-primary")} />
                )}
              </div>
              {stepIdx !== steps.length - 1 && (
                <div
                  className={cn("h-0.5 w-24 bg-border", {
                    "bg-primary": currentStep > step.id + 1,
                  })}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <ol className="flex w-full max-w-[500px] items-center justify-between text-sm font-medium">
            {steps.map((step) => (
              <li key={step.name} className={cn("text-center", currentStep >= step.id && "text-primary", "flex-1")}>
                {step.name}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl">
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Luggage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="luggage-type">Luggage Type</Label>
                  <RadioGroup defaultValue="checked" id="luggage-type" className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="carry-on" id="carry-on" className="peer sr-only" />
                      <Label
                        htmlFor="carry-on"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Luggage className="mb-3 h-6 w-6" />
                        Carry-on
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="checked" id="checked" className="peer sr-only" />
                      <Label
                        htmlFor="checked"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Luggage className="mb-3 h-6 w-6" />
                        Checked
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="oversized" id="oversized" className="peer sr-only" />
                      <Label
                        htmlFor="oversized"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Luggage className="mb-3 h-6 w-6" />
                        Oversized
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="Enter luggage weight" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Select>
                    <SelectTrigger id="quantity">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Price Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Base Price</span>
                    <span className="font-medium">$50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Weight Surcharge</span>
                    <span className="font-medium">$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Insurance</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">$65.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review & Pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Luggage Details</h3>
                  <div className="text-sm space-y-1">
                    <p>Type: Checked Luggage</p>
                    <p>Weight: 20kg</p>
                    <p>Quantity: 1</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Price Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Base Price</span>
                      <span>$50.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weight Surcharge</span>
                      <span>$10.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Insurance</span>
                      <span>$5.00</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>$65.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep((prev) => prev + 1)
              } else {
                // Handle payment submission
                console.log("Processing payment...")
              }
            }}
          >
            {currentStep === 3 ? "Pay Now" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

