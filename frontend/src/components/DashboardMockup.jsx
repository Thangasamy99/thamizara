const VARIANTS = {
  business: {
    app: "BizFlow — Business Suite",
    nav: ["Overview", "Sales", "Inventory", "Billing", "Reports"],
    stats: [
      { label: "Today's Sales", value: "$1,284", delta: "+12%" },
      { label: "Orders", value: "86", delta: "+8%" },
      { label: "Stock Items", value: "342", delta: "Live" },
    ],
    chartLabel: "Weekly revenue",
    recordLabel: "Recent invoices",
    recordPrefix: "INV",
    statuses: ["Paid", "Pending", "Paid", "Paid", "Pending", "Paid"],
  },
  hms: {
    app: "MediCore — Hospital Suite",
    nav: ["Dashboard", "Patients", "Doctors", "Pharmacy", "Laboratory"],
    stats: [
      { label: "Patients Today", value: "124", delta: "+9%" },
      { label: "Appointments", value: "38", delta: "Today" },
      { label: "Lab Reports", value: "57", delta: "Ready" },
    ],
    chartLabel: "Admissions this week",
    recordLabel: "Patient records",
    recordPrefix: "PT",
    statuses: ["Admitted", "In Lab", "Discharged", "Admitted", "Review", "Discharged"],
  },
  eye: {
    app: "OptiCare — Eye Hospital Suite",
    nav: ["Dashboard", "Patients", "Eye Exams", "Optical Shop", "Appointments"],
    stats: [
      { label: "Patients Today", value: "96", delta: "+6%" },
      { label: "Eye Exams", value: "41", delta: "Today" },
      { label: "Prescriptions", value: "33", delta: "Issued" },
    ],
    chartLabel: "Consultations this week",
    recordLabel: "Exam records",
    recordPrefix: "EYE",
    statuses: ["Refraction", "Dilation", "Dispensed", "Refraction", "Follow-up", "Dispensed"],
  },
  school: {
    app: "EduTrack — School Suite",
    nav: ["Dashboard", "Students", "Teachers", "Attendance", "Exams", "Fees"],
    stats: [
      { label: "Students", value: "1,240", delta: "Active" },
      { label: "Present Today", value: "93%", delta: "+2%" },
      { label: "Fees Collected", value: "$4.2k", delta: "This week" },
    ],
    chartLabel: "Attendance this week",
    recordLabel: "Student records",
    recordPrefix: "STU",
    statuses: ["Enrolled", "Fees Due", "Enrolled", "Cleared", "Enrolled", "Fees Due"],
  },
  pms: {
    app: "EstatePro — Property Suite",
    nav: ["Dashboard", "Properties", "Tenants", "Payments", "Reports"],
    stats: [
      { label: "Properties", value: "48", delta: "Active" },
      { label: "Tenants", value: "132", delta: "+4" },
      { label: "Rent Due", value: "12", delta: "This week" },
    ],
    chartLabel: "Rent collection",
    recordLabel: "Payment records",
    recordPrefix: "UNIT",
    statuses: ["Paid", "Pending", "Paid", "Overdue", "Paid", "Paid"],
  },
  shop: {
    app: "ShopCore — Commerce Suite",
    nav: ["Dashboard", "Orders", "Products", "Customers", "Payments"],
    stats: [
      { label: "Orders", value: "214", delta: "+15%" },
      { label: "Revenue", value: "$3,860", delta: "+11%" },
      { label: "Products", value: "480", delta: "In stock" },
    ],
    chartLabel: "Sales this week",
    recordLabel: "Recent orders",
    recordPrefix: "ORD",
    statuses: ["Delivered", "Processing", "Shipped", "Delivered", "Processing", "Delivered"],
  },
  church: {
    app: "FlockBase — Church Suite",
    nav: ["Dashboard", "Members", "Events", "Donations", "Groups"],
    stats: [
      { label: "Members", value: "620", delta: "Active" },
      { label: "Events", value: "8", delta: "This month" },
      { label: "Donations", value: "$1,150", delta: "This week" },
    ],
    chartLabel: "Giving this month",
    recordLabel: "Member records",
    recordPrefix: "MBR",
    statuses: ["Active", "New", "Active", "Active", "Inactive", "New"],
  },
  hotel: {
    app: "StaySuite — Hotel Manager",
    nav: ["Dashboard", "Rooms", "Reservations", "Guests", "Housekeeping"],
    stats: [
      { label: "Occupancy", value: "78%", delta: "+5%" },
      { label: "Check-ins", value: "24", delta: "Today" },
      { label: "Rooms", value: "52", delta: "Total" },
    ],
    chartLabel: "Bookings this week",
    recordLabel: "Reservations",
    recordPrefix: "RM",
    statuses: ["Occupied", "Reserved", "Cleaning", "Occupied", "Reserved", "Check-out"],
  },
  hostel: {
    app: "HostelHub — Hostel Manager",
    nav: ["Dashboard", "Rooms", "Beds", "Occupants", "Payments"],
    stats: [
      { label: "Occupants", value: "186", delta: "Resident" },
      { label: "Beds Free", value: "14", delta: "Available" },
      { label: "Payments Due", value: "9", delta: "This week" },
    ],
    chartLabel: "Occupancy this month",
    recordLabel: "Occupant records",
    recordPrefix: "BED",
    statuses: ["Paid", "Due", "Paid", "Reserved", "Paid", "Due"],
  },
};

const barHeights = ["42%", "66%", "52%", "80%", "58%", "92%", "70%"];
const rowWidths = ["w-2/3", "w-1/2", "w-3/5", "w-1/2", "w-3/5", "w-2/3"];
const warnStatuses = new Set(["Pending", "Overdue", "Due", "Fees Due", "Processing", "Reserved", "Review", "Follow-up", "Cleaning", "Dilation", "Check-out", "In Lab"]);

function StatusPill({ status }) {
  const warn = warnStatuses.has(status);
  return (
    <span
      className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${
        warn ? "bg-amber-50 text-amber-600" : "bg-accent-100 text-accent-600"
      }`}
    >
      {status}
    </span>
  );
}

function RecordRow({ prefix, index, status, width }) {
  const id = `${prefix}-${4820 - index}`;
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[7px] font-bold text-brand-600">
        {prefix.slice(0, 2)}
      </div>
      <span className="w-14 shrink-0 text-[8px] font-semibold text-ink-700">{id}</span>
      <div className={`h-2 rounded bg-mist-50 ring-1 ring-line ${width}`} />
      <StatusPill status={status} />
    </div>
  );
}

function Chart({ label, tall = false }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-semibold text-ink-700">{label}</span>
        <span className="text-[8px] font-medium text-ink-400">Last 7 days</span>
      </div>
      <div className={`flex items-end gap-1.5 ${tall ? "h-28 sm:h-36" : "h-20 sm:h-24"}`}>
        {barHeights.map((height, i) => (
          <div
            key={i}
            style={{ height }}
            className={`flex-1 rounded-t-md ${i === barHeights.length - 2 ? "bg-brand-500" : "bg-brand-100"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardMockup({ variant = "business", screen = "dashboard", className = "" }) {
  const v = VARIANTS[variant] ?? VARIANTS.business;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-ink-900/10 ${className}`}
      aria-hidden="true"
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-line bg-mist-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 hidden rounded-md bg-white px-2.5 py-1 text-[9px] font-medium text-ink-400 ring-1 ring-line sm:block">
          {v.app}
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-28 shrink-0 flex-col gap-1.5 border-r border-line bg-white p-3 sm:flex">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-md bg-brand-600" />
            <div className="h-2 w-10 rounded bg-ink-900/20" />
          </div>
          {v.nav.map((item, i) => (
            <div
              key={item}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                i === 0 ? "bg-brand-100" : ""
              }`}
            >
              <div className={`h-2.5 w-2.5 rounded-sm ${i === 0 ? "bg-brand-600" : "bg-ink-400/40"}`} />
              <span className={`text-[8px] font-medium ${i === 0 ? "text-brand-700" : "text-ink-400"}`}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Main panel — varies by screen type */}
        <div className="min-w-0 flex-1 p-4">
          {screen === "records" ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-7 flex-1 rounded-lg border border-line bg-mist-50 px-2.5 text-[9px] leading-7 text-ink-400">
                  Search records…
                </div>
                <div className="h-7 w-16 rounded-lg bg-brand-600 text-center text-[9px] font-semibold leading-7 text-white">
                  + New
                </div>
              </div>
              <p className="mb-2 text-[9px] font-semibold text-ink-700">{v.recordLabel}</p>
              <div className="space-y-2">
                {v.statuses.map((status, i) => (
                  <RecordRow key={i} prefix={v.recordPrefix} index={i} status={status} width={rowWidths[i]} />
                ))}
              </div>
            </>
          ) : screen === "analytics" ? (
            <>
              <div className="mb-3 grid grid-cols-3 gap-2.5">
                {v.stats.map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-brand-50 px-2 py-1.5">
                    <p className="truncate text-[7px] font-medium text-ink-500">{stat.label}</p>
                    <p className="font-heading text-xs font-bold text-ink-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <Chart label={v.chartLabel} tall />
              <div className="mt-2.5 flex gap-2">
                {v.nav.slice(1, 4).map((n) => (
                  <span key={n} className="rounded-full border border-line px-2 py-0.5 text-[7px] font-medium text-ink-500">
                    {n}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2.5">
                {v.stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-line bg-mist-50 p-2.5">
                    <p className="truncate text-[8px] font-medium text-ink-500">{stat.label}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-1">
                      <span className="font-heading text-sm font-bold text-ink-900">{stat.value}</span>
                      <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[7px] font-semibold text-accent-600">
                        {stat.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <Chart label={v.chartLabel} />
              </div>
              <div className="space-y-2">
                {v.statuses.slice(0, 3).map((status, i) => (
                  <RecordRow key={i} prefix={v.recordPrefix} index={i} status={status} width={rowWidths[i]} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
