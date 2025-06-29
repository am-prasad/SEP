import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Adjust the import path as needed

const FAQSection = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is your return policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 30-day return policy with a full refund. Contact support for more info.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I track my order?</AccordionTrigger>
        <AccordionContent>
          You will receive a tracking link via email once your order ships.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FAQSection;
