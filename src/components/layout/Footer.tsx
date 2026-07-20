export default function Footer() {
  return (
    <footer className="bg-[#013253] text-white py-8 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-3 text-[#00AFF1]">Términos y condiciones</h4>
          <ul className="space-y-1 text-sm text-white/70">
            <li>Políticas de privacidad</li>
            <li>Términos y condiciones</li>
            <li>Ayuda</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-[#00AFF1]">Información de contacto</h4>
          <p className="text-sm text-white/70">(+57) 315 654 9290</p>
          <p className="text-sm text-white/70">Dr.Dentix@hotmail.com</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="text-white font-bold text-xl">Dr. Dentix</span>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/Dr.Dentix/" target="_blank" rel="noreferrer"
              className="text-white/70 hover:text-white text-sm">Facebook</a>
            <a href="https://api.whatsapp.com/send?phone=573156549290" target="_blank" rel="noreferrer"
              className="text-white/70 hover:text-white text-sm">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
