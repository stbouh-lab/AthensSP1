# analyse.R  – HB-MXL + market simulator
library(mlogit)
library(readr)
library(openxlsx)

# 1. read .CHO ----------------------------------------------------------------
cho <- read_csv("athens-choice.choo", col_types = cols())

# 2. mlogit format -----------------------------------------------------------
mldata <- dfidx(cho, idx = list(c("Task", "Concept"), "Response"), choice = "Response")

# 3. HB-MXL ------------------------------------------------------------------
set.seed(123)
hb <- mlogit(Response ~ WhiteLabel + Method + DeliveryTime + DeliveryCost +
               StorageDays + WalkTime + HomeWindow + LockerFill +
               Accessibility + Flexibility | 0,
             data = mldata, panel = TRUE, method = "bfgs", iterlim = 200)

# 4. print summary ------------------------------------------------------------
summary(hb)

# 5. WTP (€ per unit) ---------------------------------------------------------
wtp <- coef(hb) / -coef(hb)["DeliveryCost"]
wtp

# 6. importance shares (relative effects) -----------------------------------
imp <- abs(coef(hb)) / sum(abs(coef(hb)))
imp

# 7. market simulator --------------------------------------------------------
# baseline scenario
base <- data.frame(
  WhiteLabel = 0,
  Method = c(0, 1, 2),      # Home, Depot, Locker
  DeliveryTime = 1,         # next-day
  DeliveryCost = 5,
  StorageDays = 3,
  WalkTime = 8,
  HomeWindow = 1,           # 5-hour slot
  LockerFill = 1,           # half-full
  Accessibility = 0,        # none
  Flexibility = 1           # day-change
)

# predict shares
shares <- predict(hb, newdata = dfidx(base, idx = "Method"), type = "prob")
shares

# 8. export to Excel ---------------------------------------------------------
wb <- createWorkbook()
addWorksheet(wb, "Results")
writeData(wb, "Results", data.frame(
  Attribute = names(coef(hb)),
  Coefficient = coef(hb),
  `t-value` = summary(hb)$CoefTable[, 3],
  WTP_EUR = wtp,
  Importance = imp
))
addWorksheet(wb, "Shares")
writeData(wb, "Shares", data.frame(Method = c("Home", "Depot", "Locker"), Share = shares))
saveWorkbook(wb, "Athens_Results.xlsx", overwrite = TRUE)

cat("✅ Analysis complete – open Athens_Results.xlsx\n")
