  import MaintenancePage from "@/components/MaintenanceBanner";
  import { Button, Input, message } from "antd";
  import { useState } from "react";

  export default function Home() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [messageText, setMessageText] = useState("");

    const [isMaintenance, setIsMaintenance] = useState(false);

    const handleContactSubmit = () => {
      message.success("Message sent!");
      setName("");
      setEmail("");
      setMessageText("");
    };

    // Smooth scroll to section
    const scrollToSection = (id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const classes = [
      { title: "Yoga", description: "Improve flexibility, posture & mind-body connection.", image: "/images/class1.png" },
      { title: "HIIT", description: "High-intensity workouts for fat burning & endurance.", image: "/images/class2.png" },
      { title: "CrossFit", description: "Functional movements & strength conditioning.", image: "/images/class3.png" },
      { title: "Weight Training", description: "Build muscle, tone body & increase metabolism.", image: "/images/class4.png" },
    ];

    const trainers = [
      { name: "John Doe", specialty: "Yoga Trainer", image: "/images/trainer1.png" },
      { name: "Jane Smith", specialty: "HIIT Coach", image: "/images/trainer2.png" },
      { name: "Mike Johnson", specialty: "CrossFit Coach", image: "/images/trainer3.png" },
      { name: "Sara Lee", specialty: "Personal Trainer", image: "/images/trainer4.png" },
    ];

    const memberships = [
      { name: "Basic", price: "$20/mo", features: ["Gym access", "1 personal session"], gradient: "from-gray-700 to-gray-900" },
      { name: "Premium", price: "$35/mo", features: ["Gym access", "5 personal sessions", "Group classes"], gradient: "from-orange-500 to-red-600" },
      { name: "Elite", price: "$49/mo", features: ["All access", "Unlimited sessions", "Diet plan"], gradient: "from-blue-500 to-indigo-700" },
    ];

    return (
      <>
        <MaintenancePage />

        {!isMaintenance && (
          <div className="font-sans text-gray-100">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-95 z-50 shadow-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
                <div className="text-2xl font-bold text-orange-500 cursor-pointer" onClick={() => scrollToSection("hero")}>
                  PowerForge
                </div>
                <div className="hidden md:flex gap-8 text-white font-semibold">
                  <button onClick={() => scrollToSection("hero")}>Home</button>
                  <button onClick={() => scrollToSection("about")}>About</button>
                  <button onClick={() => scrollToSection("trainers")}>Trainers</button>
                  <button onClick={() => scrollToSection("contact")}>Contact</button>
                </div>
                <div className="flex gap-2">
                  <Button>Sign In</Button>
                  <Button type="primary" className="bg-orange-500! hover:bg-orange-600! text-white!">
                    Sign Up
                  </Button>
                </div>
              </div>
            </nav>

            {/* Hero Section */}
            <section
              id="hero"
              className="relative h-screen flex items-center justify-center pt-20"
              style={{ background: "linear-gradient(90deg, #1E3A8A 0%, #7F3DFF 100%)" }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/80 to-purple-700/80"></div>

              {/* Content */}
              <div className="relative z-10 max-w-6xl px-6 flex flex-col md:flex-row items-center gap-12">
                {/* Left Content */}
                <div className="flex-1 text-center md:text-left space-y-6">
                  <h1 className="text-5xl md:text-6xl font-bold text-white">
                    Transform Your <span className="text-orange-400">Body</span>
                  </h1>
                  <p className="text-gray-200 text-lg md:text-xl">
                    Why sir end believe uncivil respect. Always get adieus nature day course for common. My little garret repair to desire he esteem.
                  </p>

                  {/* Email Input + Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                    <Input
                      placeholder="Enter your email to get started"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 w-full sm:w-80 rounded-l-lg px-4"
                    />
                    <Button
                      type="primary"
                      className="h-14! px-6! bg-orange-500! hover:bg-orange-600! text-white! font-semibold! rounded-r-lg!"
                    >
                      Get Started
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 mt-10 text-white font-bold">
                    <div className="text-center">
                      <p className="text-3xl text-orange-400">15</p>
                      <p className="text-sm text-gray-200">Workouts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl text-yellow-400">240</p>
                      <p className="text-sm text-gray-200">Minutes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl text-cyan-400">10</p>
                      <p className="text-sm text-gray-200">Professional Mentor</p>
                    </div>
                  </div>
                </div>

                {/* Right Image */}
                <div className="flex-1 relative">
                  <img
                    src="/images/trainer1.png"
                    alt="Trainer"
                    className="rounded-xl shadow-2xl mx-auto md:mx-0"
                  />

                  {/* Example overlay badges */}
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-lg font-bold">
                    2.95 km
                  </div>
                  <div className="absolute bottom-10 left-4 bg-black/80 text-white px-3 py-1 rounded-lg flex items-center gap-1">
                    <span>450+</span> Video Tutorial
                  </div>
                  <div className="absolute bottom-10 right-4 bg-purple-600 text-white px-3 py-1 rounded-lg">
                    200+ Free Workout Videos
                  </div>
                </div>
              </div>
            </section>

            {/* About / Why Join */}
            <section id="about" className="py-14 px-50 bg-gray-900 flex flex-col md:flex-row justify-center items-center gap-12">
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-4xl font-bold mb-4">Why Join Us?</h2>
                <ul className="list-disc ml-6 text-lg space-y-2">
                  <li>Good Workout Facilities</li>
                  <li>Expert Coaches</li>
                  <li>Consultation With Experts</li>
                  <li>Best Gym in Town</li>
                </ul>
                <Button className="mt-6! bg-orange-500! hover:bg-orange-600! text-white! px-6! py-2! rounded-lg! border-none!">See More Benefits</Button>
              </div>
              <div className="md:w-1/2">
                <img src="/images/trainer1.png" className="rounded-xl shadow-2xl" />
              </div>
            </section>

            {/* Trainers */}
            <section id="trainers" className="py-24 px-6 bg-gray-800">
              <h2 className="text-4xl font-bold text-center mb-16!">Meet Our Trainers</h2>
              <div className="flex flex-wrap justify-center gap-8">
                {trainers.map((t, i) => (
                  <div key={i} className="w-64 p-6 bg-gray-700 rounded-3xl shadow-2xl hover:scale-105 transform transition text-center">
                    <img src={t.image} className="rounded-full w-36 h-36 mx-auto -mt-20 border-4 border-orange-500 shadow-xl" />
                    <h3 className="text-xl font-bold mt-6 text-white">{t.name}</h3>
                    <p className="text-gray-300">{t.specialty}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Classes */}
            <section className="py-24 px-6 bg-gray-800">
              <h2 className="text-4xl font-bold text-center mb-12">Build a Cool Body</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {classes.map((c, i) => (
                  <div key={i} className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer hover:scale-105 transform transition">
                    <img src={c.image} className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-lg">{c.title}</h3>
                      <p className="text-white text-sm">{c.description}</p>
                      <Button className="mt-2! bg-orange-500! hover:bg-orange-600! text-white! w-full! border-none!">Join Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="py-24 px-6 bg-gray-800">
              <h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
              <div className="max-w-2xl mx-auto space-y-4!">
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-6 h-14 rounded-lg shadow-md" />
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-6 h-14 rounded-lg shadow-md" />
                <Input.TextArea rows={6} placeholder="Message" value={messageText} onChange={(e) => setMessageText(e.target.value)} className="mb-6 rounded-lg shadow-md" />
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleContactSubmit}
                  className="bg-orange-500! hover:bg-orange-600! font-bold! text-white! rounded-lg!"
                >
                  Send Message
                </Button>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-8 px-6 text-center">
              <p className="text-lg">&copy; {new Date().getFullYear()} PowerForge. All Rights Reserved.</p>
              <div className="flex justify-center gap-6 mt-4">
                <a href="#" className="hover:text-orange-500 transition">Facebook</a>
                <a href="#" className="hover:text-orange-500 transition">Instagram</a>
                <a href="#" className="hover:text-orange-500 transition">Twitter</a>
              </div>
            </footer>
          </div>
        )}
      </>
    );
  } 
  