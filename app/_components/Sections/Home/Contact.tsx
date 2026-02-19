import { Mail, Instagram, Linkedin, Globe } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="min-h-[80svh] px-6 py-24 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-16">
          <p className="text-muted-foreground mb-2">04</p>
          <h2 className="text-3xl md:text-5xl tracking-tight">GET IN TOUCH</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
          <div className="space-y-8 lg:col-span-2">
            <p className="text-lg">
              Available for commissioned work, collaborations, and inquiries.
              Let`s create something meaningful together.
            </p>
            
            <div className="space-y-4">
              <a 
                href="mailto:hello@example.com"
                className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-crosshair group"
              >
                <Mail size={20} className="text-muted-foreground " />
                <span>HELLO@EXAMPLE.COM</span>
              </a>
              
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="w-5" />
                <span>YOUR LOCATION</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-muted-foreground mb-4">SOCIAL</p>
              <div className="space-y-3 lg:flex lg:flex-row lg:gap-8 lg:space-y-0">
                <a 
                  href="https://www.instagram.com/yourhandle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center cursor-crosshair gap-3 hover:opacity-70 transition-opacity"
                >
                  <Instagram size={20} className="text-muted-foreground" />
                  <span>INSTAGRAM</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/yourprofile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center cursor-crosshair gap-3 hover:opacity-70 transition-opacity"
                >
                  <Linkedin size={20} className="text-muted-foreground" />
                  <span>LINKEDIN</span>
                </a>
                <a 
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 cursor-crosshair hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  <Globe size={20} className="text-muted-foreground" />
                  <span>WEBSITE</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
}
