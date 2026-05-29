import { useState, useEffect } from "react";

const DEVICE_KEY = "thamar_registered_device";
const PROJECT_ID = "thamar-elhayat";
const API_KEY = "AIzaSyBAuCf-xbhuWA_YboQZ42kfvjVull2QBNI";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function addRegistration(data) {
  const res = await fetch(`${BASE_URL}/registrations?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        fullName: { stringValue: data.fullName },
        phone: { stringValue: data.phone },
        invitedBy: { stringValue: data.invitedBy },
        age: { integerValue: data.age },
        registeredAt: { stringValue: data.registeredAt },
      },
    }),
  });
  if (!res.ok) throw new Error("فشل الحفظ");
  return res.json();
}

async function checkPhoneExists(phone) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "registrations" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "phone" },
              op: "EQUAL",
              value: { stringValue: phone },
            },
          },
          limit: 1,
        },
      }),
    }
  );
  const data = await res.json();
  return data.some((d) => d.document);
}

async function getRegistrations() {
  const res = await fetch(`${BASE_URL}/registrations?key=${API_KEY}&pageSize=300`);
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map((doc) => ({
    id: doc.name,
    fullName: doc.fields.fullName?.stringValue || "",
    phone: doc.fields.phone?.stringValue || "",
    invitedBy: doc.fields.invitedBy?.stringValue || "",
    age: doc.fields.age?.integerValue || "",
    registeredAt: doc.fields.registeredAt?.stringValue || "",
  }));
}

export default function App() {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ fullName: "", phone: "", invitedBy: "", age: "" });
  const [errors, setErrors] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DEVICE_KEY)) setStep("already_registered");
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().split(" ").length < 2)
      errs.fullName = "اكتب اسمك بالكامل (الاسم واللقب على الأقل)";
    if (!/^(010|011|012|015)\d{8}$/.test(form.phone.replace(/\s/g, "")))
      errs.phone = "رقم الهاتف غير صحيح، تأكد من الرقم";
    if (!form.invitedBy.trim())
      errs.invitedBy = "من دعاكم للمؤتمر؟";
    if (!form.age || isNaN(form.age) || form.age < 1 || form.age > 100)
      errs.age = "أدخل سنك بشكل صحيح";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const phone = form.phone.replace(/\s/g, "");
      const exists = await checkPhoneExists(phone);
      if (exists) {
        localStorage.setItem(DEVICE_KEY, "true");
        setStep("already_registered");
        setLoading(false);
        return;
      }
      await addRegistration({
        fullName: form.fullName.trim(),
        phone,
        invitedBy: form.invitedBy.trim(),
        age: Number(form.age),
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem(DEVICE_KEY, "true");
      setStep("success");
    } catch {
      alert("حدث خطأ، حاول مرة ثانية");
    }
    setLoading(false);
  };

  const handleAdminLogin = async () => {
    if (adminPass === "admin2025") {
      setLoading(true);
      const data = await getRegistrations();
      setRegistrations(data);
      setAdminMode(true);
      setShowAdmin(false);
      setLoading(false);
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const bg = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a1a 0%, #0d1f3c 50%, #0a0a1a 100%)",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    direction: "rtl",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };
  const header = { width: "100%", textAlign: "center", padding: "48px 24px 0" };
  const badge = {
    display: "inline-block",
    background: "rgba(255,200,50,0.12)",
    border: "1px solid rgba(255,200,50,0.4)",
    color: "#ffc832", fontSize: "12px", fontWeight: "700",
    letterSpacing: "3px", padding: "6px 18px", borderRadius: "30px", marginBottom: "20px",
  };
  const titleStyle = {
    fontSize: "clamp(28px, 6vw, 52px)", fontWeight: "900", color: "#fff",
    margin: "0 0 8px", lineHeight: 1.15, textShadow: "0 0 40px rgba(99,179,237,0.3)",
  };
  const subtitleStyle = { fontSize: "clamp(14px,3vw,18px)", color: "rgba(255,255,255,0.55)", marginBottom: "40px" };
  const card = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px", padding: "clamp(24px,5vw,48px)", width: "100%",
    maxWidth: "520px", margin: "0 24px 40px", backdropFilter: "blur(12px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
  };
  const labelStyle = { display: "block", color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "600", marginBottom: "8px" };
  const inputStyle = (hasErr) => ({
    width: "100%", background: "rgba(255,255,255,0.07)",
    border: `1.5px solid ${hasErr ? "#fc8181" : "rgba(255,255,255,0.12)"}`,
    borderRadius: "12px", padding: "14px 16px", color: "#fff", fontSize: "16px",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: "rtl",
  });
  const errText = { color: "#fc8181", fontSize: "12px", marginTop: "4px" };
  const btn = {
    width: "100%",
    background: loading ? "rgba(255,200,50,0.4)" : "linear-gradient(135deg, #ffc832, #ff8c00)",
    border: "none", borderRadius: "14px", padding: "16px", color: "#0a0a1a",
    fontSize: "17px", fontWeight: "800", fontFamily: "inherit",
    cursor: loading ? "not-allowed" : "pointer", marginTop: "8px",
    boxShadow: "0 6px 30px rgba(255,200,50,0.3)",
  };
  const fieldGroup = { marginBottom: "20px" };

  if (adminMode) return (
    <div style={bg}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div style={header}>
        <h1 style={{ ...titleStyle, fontSize: "28px" }}>📋 مسجلي مؤتمر ثمر الحياة</h1>
        <p style={subtitleStyle}>إجمالي المسجلين: <strong style={{ color: "#ffc832" }}>{registrations.length}</strong></p>
      </div>
      <div style={{ width: "100%", maxWidth: "800px", padding: "0 16px 40px" }}>
        {registrations.length === 0
          ? <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "40px" }}>لا يوجد مسجلين بعد</p>
          : registrations.map((r, i) => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "20px 24px", marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <span style={{ background: "rgba(255,200,50,0.15)", color: "#ffc832", borderRadius: "8px", padding: "4px 12px", fontWeight: "700", fontSize: "14px" }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ color: "#fff", fontWeight: "700", fontSize: "17px" }}>{r.fullName}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "2px" }}>{r.phone} · السن: {r.age} · دعاه: {r.invitedBy}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                {new Date(r.registeredAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        <button onClick={() => setAdminMode(false)} style={{ ...btn, background: "rgba(255,255,255,0.1)", color: "#fff", marginTop: "16px" }}>رجوع</button>
      </div>
    </div>
  );

  if (step === "already_registered") return (
    <div style={bg}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div style={header}>
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>🚫</div>
        <h1 style={{ ...titleStyle, color: "#fc8181" }}>سبق التسجيل</h1>
        <p style={{ ...subtitleStyle, maxWidth: "400px", margin: "0 auto 40px" }}>
          أنت سبق وسجلت في هذا المؤتمر من قبل.<br />
          <span style={{ color: "#ffc832" }}>التسجيل مرة واحدة فقط لكل شخص.</span>
        </p>
      </div>
      <div style={{ ...card, textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", lineHeight: 1.8 }}>إذا كنت تعتقد أن هناك خطأ، يرجى التواصل مع منظمي المؤتمر.</p>
      </div>
    </div>
  );

  if (step === "success") return (
    <div style={bg}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div style={header}>
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>🎉</div>
        <h1 style={{ ...titleStyle, color: "#68d391" }}>تم التسجيل بنجاح!</h1>
        <p style={{ ...subtitleStyle, maxWidth: "400px", margin: "0 auto 40px" }}>
          أهلاً <strong style={{ color: "#ffc832" }}>{form.fullName.split(" ")[0]}</strong>!<br />
          تسجيلك في المؤتمر تم بنجاح، نتمنى لك تجربة رائعة.
        </p>
      </div>
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ background: "rgba(104,211,145,0.08)", border: "1px solid rgba(104,211,145,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 4px" }}>الاسم الكامل</p>
          <p style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>{form.fullName}</p>
        </div>
        <div style={{ background: "rgba(104,211,145,0.08)", border: "1px solid rgba(104,211,145,0.2)", borderRadius: "14px", padding: "20px" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 4px" }}>رقم الهاتف</p>
          <p style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0, direction: "ltr" }}>{form.phone}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={bg}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      <div style={header}>
        <div style={badge}>مؤتمر ثمر الحياة</div>
        <h1 style={titleStyle}>ثمر الحياة</h1>
        <p style={subtitleStyle}></p>
      </div>
      <div style={card}>
        <div style={fieldGroup}>
          <label style={labelStyle}>الاسم الكامل *</label>
          <input style={inputStyle(errors.fullName)} type="text" placeholder="" value={form.fullName}
            onChange={(e) => { setForm({ ...form, fullName: e.target.value }); setErrors({ ...errors, fullName: "" }); }} />
          {errors.fullName && <p style={errText}>{errors.fullName}</p>}
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>رقم الهاتف *</label>
          <input style={{ ...inputStyle(errors.phone), direction: "ltr", textAlign: "right" }} type="tel" placeholder="01xxxxxxxxx" value={form.phone}
            onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: "" }); }} />
          {errors.phone && <p style={errText}>{errors.phone}</p>}
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>من دعاك للمؤتمر؟ *</label>
          <input style={inputStyle(errors.invitedBy)} type="text" placeholder="اسم الشخص الذي دعاك" value={form.invitedBy}
            onChange={(e) => { setForm({ ...form, invitedBy: e.target.value }); setErrors({ ...errors, invitedBy: "" }); }} />
          {errors.invitedBy && <p style={errText}>{errors.invitedBy}</p>}
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>السن *</label>
          <input style={{ ...inputStyle(errors.age), direction: "ltr", textAlign: "right" }} type="number" placeholder="" min="1" max="100" value={form.age}
            onChange={(e) => { setForm({ ...form, age: e.target.value }); setErrors({ ...errors, age: "" }); }} />
          {errors.age && <p style={errText}>{errors.age}</p>}
        </div>
        <button style={btn} onClick={handleSubmit} disabled={loading}>
          {loading ? "جاري التسجيل..." : "تسجيل الآن ←"}
        </button>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "20px" }}>
          التسجيل مسموح به مرة واحدة فقط لكل شخص
        </p>
      </div>
      <div style={{ marginBottom: "30px" }}>
        {!showAdmin
          ? <button onClick={() => setShowAdmin(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>⚙</button>
          : <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="password" placeholder="كلمة المرور" value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                style={{ ...inputStyle(false), width: "160px", fontSize: "14px", padding: "10px 14px" }} />
              <button onClick={handleAdminLogin} style={{ ...btn, width: "auto", padding: "10px 20px", marginTop: 0, fontSize: "14px" }}>دخول</button>
            </div>}
      </div>
    </div>
  );
}
