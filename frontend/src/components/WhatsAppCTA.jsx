import { MessageCircle, Mail } from "lucide-react";
import Button from "./Button";
import { siteConfig } from "../config/siteConfig";

/**
 * WhatsApp call-to-action. Falls back to email when no WhatsApp number is
 * configured in siteConfig — never links to a dead wa.me URL.
 */
export default function WhatsAppCTA({
  message = "Hello THAMIZARA, I would like to discuss a project.",
  children = "WhatsApp Us",
  variant = "outlineLight",
  size = "lg",
  className = "",
}) {
  const { whatsappNumber, email } = siteConfig.contact;

  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : `mailto:${email}?subject=${encodeURIComponent("Project enquiry — THAMIZARA Technologies")}&body=${encodeURIComponent(message)}`;

  return (
    <Button href={href} variant={variant} size={size} className={className}>
      {whatsappNumber ? <MessageCircle size={18} /> : <Mail size={18} />}
      {whatsappNumber ? children : "Email Us"}
    </Button>
  );
}
