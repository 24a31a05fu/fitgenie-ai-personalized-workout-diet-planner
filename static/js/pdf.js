// PDF Report Compiler using jsPDF CDN
const PDFModule = {
    renderPreview() {
        if (!window.AppState || !window.AppState.isProfileCompleted) return;

        const profile = window.AppState.profile;
        const telemetry = window.AppState.telemetry;

        const nameNode = document.getElementById('rp-preview-name');
        const ageNode = document.getElementById('rp-preview-age');
        const bmiNode = document.getElementById('rp-preview-bmi');
        const caloriesNode = document.getElementById('rp-preview-calories');
        const proteinNode = document.getElementById('rp-preview-protein');
        const goalNode = document.getElementById('rp-preview-goal');
        const dietNode = document.getElementById('rp-preview-diet');

        if (nameNode) nameNode.innerText = profile.name;
        if (ageNode) ageNode.innerText = profile.age;
        if (bmiNode) bmiNode.innerText = telemetry.bmi;
        if (caloriesNode) caloriesNode.innerText = `${telemetry.goal_calories.toLocaleString()} kcal`;
        if (proteinNode) proteinNode.innerText = `${telemetry.protein_req}g`;
        if (goalNode) goalNode.innerText = profile.goal;
        if (dietNode) dietNode.innerText = `${profile.dietary_pref} (${profile.budget} Budget)`;
        
        const riskNode = document.getElementById('rp-preview-risk');
        if (riskNode) riskNode.innerText = telemetry.risk_level || "Healthy Range";
    },

    async downloadPDF() {
        if (!window.AppState || !window.AppState.isProfileCompleted) {
            window.Toast.show("Please complete profile onboarding first!", "error");
            return;
        }

        const btn = document.getElementById('download-pdf-report-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Compiling Report...`;
        btn.disabled = true;

        try {
            const profile = window.AppState.profile;
            const telemetry = window.AppState.telemetry;
            
            // Safe resolve jsPDF
            let jsPDFClass = null;
            if (window.jspdf && window.jspdf.jsPDF) {
                jsPDFClass = window.jspdf.jsPDF;
            } else if (window.jsPDF) {
                jsPDFClass = window.jsPDF;
            }

            if (!jsPDFClass) {
                window.Toast.show("Unable to generate report. jsPDF library not loaded.", "error");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            const doc = new jsPDFClass({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Branding Colors
            const colorPrimary = [37, 99, 235]; // Tech Blue
            const colorSecondary = [16, 185, 129]; // Emerald Green
            const colorDark = [15, 23, 42]; // Slate 900
            const colorMuted = [71, 85, 105]; // Slate 600
            const colorLight = [248, 250, 252]; // Slate 50

            // PAGE 1: COVER PAGE
            // Top Accent Ribbon
            doc.setFillColor(...colorPrimary);
            doc.rect(0, 0, 210, 15, 'F');

            // Floating circles for premium abstract look
            doc.setFillColor(239, 246, 255);
            doc.circle(180, 50, 30, 'F');
            doc.setFillColor(240, 253, 250);
            doc.circle(20, 260, 40, 'F');

            // Title Block
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.setTextColor(...colorPrimary);
            doc.text("FITGENIE AI", 20, 80);
            
            doc.setFontSize(20);
            doc.setTextColor(...colorDark);
            doc.text("Personalized Fitness & Nutrition Report", 20, 92);

            // Thin border line
            doc.setDrawColor(...colorSecondary);
            doc.setLineWidth(1);
            doc.line(20, 100, 120, 100);

            // Subtitle / Scope
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(...colorMuted);
            doc.text("A customized blueprint detailing physiological metrics,", 20, 110);
            doc.text("macro dietary allocations, and structured workouts for students.", 20, 115);

            // Student Metadata block
            doc.setFillColor(...colorLight);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.rect(20, 140, 170, 70, 'F');
            doc.rect(20, 140, 170, 70, 'S');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...colorPrimary);
            doc.text("CLIENT SUMMARY DATA", 28, 150);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...colorDark);
            doc.text(`Full Name:  ${profile.name}`, 28, 162);
            doc.text(`Age:            ${profile.age} years`, 28, 168);
            doc.text(`Gender:       ${profile.gender}`, 28, 174);
            doc.text(`Target Goal: ${profile.goal}`, 28, 180);
            
            doc.text(`Diet Type:    ${profile.dietary_pref}`, 110, 162);
            doc.text(`Budget Tier:  ${profile.budget} Range`, 110, 168);
            doc.text(`Activity:       ${profile.activity}`, 110, 174);
            doc.text(`Date Output: ${new Date().toLocaleDateString()}`, 110, 180);

            // Score Banner on Cover
            doc.setFillColor(...colorSecondary);
            doc.rect(20, 195, 170, 15, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.text(`FITNESS SCORE INDEX: ${telemetry.fitness_score} / 100`, 30, 204);

            // Footer of Cover
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(...colorMuted);
            doc.text("FitGenie AI • Personalized Student Fitness Program", 20, 280);

            // PAGE 2: BIOMETRIC TELEMETRY & DIET MATRIX
            doc.addPage();
            
            // Header bar
            doc.setFillColor(...colorPrimary);
            doc.rect(0, 0, 210, 8, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...colorPrimary);
            doc.text("1. HEALTH TELEMETRY & MACROS", 14, 22);

            // Horizontal line
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(14, 26, 196, 26);

            // Draw Metric Blocks
            let blockX = 14;
            const blockY = 32;
            const blockW = 42;
            const blockH = 22;

            // Block 1: BMI
            doc.setFillColor(...colorLight);
            doc.rect(blockX, blockY, blockW, blockH, 'F');
            doc.rect(blockX, blockY, blockW, blockH, 'S');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colorMuted);
            doc.text("BMI INDEX", blockX + 4, blockY + 6);
            doc.setFontSize(12);
            doc.setTextColor(...colorDark);
            doc.text(telemetry.bmi.toString(), blockX + 4, blockY + 14);

            // Block 2: Target Calories
            blockX += 45;
            doc.setFillColor(...colorLight);
            doc.rect(blockX, blockY, blockW, blockH, 'F');
            doc.rect(blockX, blockY, blockW, blockH, 'S');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colorMuted);
            doc.text("CALORIES TARGET", blockX + 4, blockY + 6);
            doc.setFontSize(12);
            doc.setTextColor(...colorPrimary);
            doc.text(`${telemetry.goal_calories} kcal`, blockX + 4, blockY + 14);

            // Block 3: Protein Goal
            blockX += 45;
            doc.setFillColor(...colorLight);
            doc.rect(blockX, blockY, blockW, blockH, 'F');
            doc.rect(blockX, blockY, blockW, blockH, 'S');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colorMuted);
            doc.text("DAILY PROTEIN", blockX + 4, blockY + 6);
            doc.setFontSize(12);
            doc.setTextColor(...colorSecondary);
            doc.text(`${telemetry.protein_req}g`, blockX + 4, blockY + 14);

            // Block 4: Hydration Target
            blockX += 45;
            doc.setFillColor(...colorLight);
            doc.rect(blockX, blockY, blockW, blockH, 'F');
            doc.rect(blockX, blockY, blockW, blockH, 'S');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colorMuted);
            doc.text("WATER TARGET", blockX + 4, blockY + 6);
            doc.setFontSize(12);
            doc.setTextColor(...colorDark);
            doc.text(`${telemetry.water_req} Liters`, blockX + 4, blockY + 14);

            // Section 2: Diet Planner Table
            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...colorPrimary);
            doc.text("2. STUDENT BUDGET MEAL PREP", 14, 68);
            doc.line(14, 72, 196, 72);

            // Meal prep descriptions
            const bMeal = document.getElementById('meal-desc-breakfast')?.innerText || "Oatmeal with sliced banana, peanut butter, and soy milk.";
            const lMeal = document.getElementById('meal-desc-lunch')?.innerText || "Spiced brown lentils cooked with tomatoes, served over rice.";
            const dMeal = document.getElementById('meal-desc-dinner')?.innerText || "Tofu scramble with spinach, bell peppers, onions, served with whole wheat toast.";
            const sMeal = document.getElementById('meal-desc-snacks')?.innerText || "A handful of roasted chickpeas or a banana.";
            const tips = document.getElementById('diet-summary-tips')?.innerText || "Buy dry lentils and oats in bulk. Store-brand peanut butter is cheap and provides excellent healthy fats.";

            // Grid Layout for Meals
            let mealY = 78;
            const mealsArr = [
                { title: "Breakfast", content: bMeal },
                { title: "Lunch", content: lMeal },
                { title: "Dinner", content: dMeal },
                { title: "Snacks", content: sMeal }
            ];

            mealsArr.forEach(m => {
                doc.setFillColor(...colorLight);
                doc.rect(14, mealY, 32, 16, 'F');
                doc.rect(14, mealY, 182, 16, 'S');
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(...colorPrimary);
                doc.text(m.title, 18, mealY + 10);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);
                doc.setTextColor(...colorDark);
                doc.text(doc.splitTextToSize(m.content, 140), 50, mealY + 6);
                
                mealY += 20;
            });

            // Grocery Tip box
            doc.setFillColor(240, 253, 250);
            doc.setDrawColor(...colorSecondary);
            doc.rect(14, mealY, 182, 18, 'F');
            doc.rect(14, mealY, 182, 18, 'S');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...colorSecondary);
            doc.text("BUDGET SAVING INGREDIENTS STRATEGY", 18, mealY + 5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(...colorDark);
            doc.text(doc.splitTextToSize(tips, 172), 18, mealY + 10);

            // PAGE 3: WORKOUT PLANS
            doc.addPage();
            doc.setFillColor(...colorPrimary);
            doc.rect(0, 0, 210, 8, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...colorPrimary);
            doc.text("3. AI PERSONALIZED WORKOUT DRILLS", 14, 22);
            doc.line(14, 26, 196, 26);

            const wMode = document.getElementById('workout-mode-select')?.value || "Home";
            const wLevel = document.getElementById('workout-level-select')?.value || "Beginner";
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(...colorMuted);
            doc.text(`Workout Mode:  ${wMode} Environment`, 14, 32);
            doc.text(`Training Level: ${wLevel} Plan`, 110, 32);

            // Gather exercises
            const exCards = document.querySelectorAll('#workout-exercises-grid .exercise-card');
            let workoutY = 40;

            if (exCards.length > 0) {
                // Table header
                doc.setFillColor(...colorLight);
                doc.rect(14, workoutY, 182, 8, 'F');
                doc.setDrawColor(226, 232, 240);
                doc.rect(14, workoutY, 182, 8, 'S');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(...colorDark);
                doc.text("Exercise Name", 18, workoutY + 5.5);
                doc.text("Target Muscle", 75, workoutY + 5.5);
                doc.text("Sets", 130, workoutY + 5.5);
                doc.text("Reps", 150, workoutY + 5.5);
                doc.text("Rest / Speed", 172, workoutY + 5.5);

                workoutY += 8;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8.5);

                exCards.forEach((card, index) => {
                    const name = document.getElementById(`ex-title-${index}`)?.innerText || "";
                    const muscle = document.getElementById(`ex-badge-${index}`)?.innerText || "";
                    const sets = document.getElementById(`ex-sets-${index}`)?.innerText || "";
                    const reps = document.getElementById(`ex-reps-${index}`)?.innerText || "";
                    const rest = document.getElementById(`ex-duration-${index}`)?.innerText || "";

                    doc.rect(14, workoutY, 182, 10, 'S');
                    
                    doc.text(name, 18, workoutY + 6.5);
                    doc.text(muscle, 75, workoutY + 6.5);
                    doc.text(sets, 130, workoutY + 6.5);
                    doc.text(reps, 150, workoutY + 6.5);
                    doc.text(rest, 172, workoutY + 6.5);

                    workoutY += 10;
                });
            } else {
                doc.text("No specific exercises generated yet. Please trigger 'Re-Generate Workout' in the application.", 14, workoutY + 5);
            }

            // Disclaimer bottom
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(254, 202, 202);
            doc.rect(14, 240, 182, 18, 'F');
            doc.rect(14, 240, 182, 18, 'S');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(220, 38, 38);
            doc.text("PHYSICAL EXERCISE SAFETY DISCLAIMER", 18, 245);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(...colorDark);
            doc.text("Consult a medical practitioner or qualified training coach before beginning any strenuous workout routine.", 18, 250);
            doc.text("FitGenie AI is designed for educational guidance, not direct prescription. Train safely and listen to your body.", 18, 253);

            // PAGE 4: AI HEALTH RISK PREDICTION & RECOMMENDATIONS
            doc.addPage();
            doc.setFillColor(...colorPrimary);
            doc.rect(0, 0, 210, 8, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            doc.setTextColor(...colorPrimary);
            doc.text("4. AI HEALTH RISK ANALYSIS", 14, 22);
            
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(14, 26, 196, 26);

            const riskLevel = telemetry.risk_level || "Healthy Range";
            const riskScore = telemetry.risk_score !== undefined ? `${telemetry.risk_score}%` : "10%";
            const riskInsights = telemetry.risk_insights || "Your metrics indicate a healthy balance. Keep up the active lifestyle.";
            const riskRecs = telemetry.risk_recommendations || "Maintain current fitness routine and balanced nutrition.";

            // Risk Card Colors
            let riskColor = [16, 185, 129]; // Emerald Green
            if (riskLevel === 'Obesity Risk') {
                riskColor = [239, 68, 68]; // Red
            } else if (riskLevel === 'Overweight Risk' || riskLevel === 'Sedentary Lifestyle Risk') {
                riskColor = [245, 158, 11]; // Amber
            } else if (riskLevel === 'Underweight Risk') {
                riskColor = [6, 182, 212]; // Cyan
            }

            // Level Card Y=32
            doc.setFillColor(...colorLight);
            doc.setDrawColor(226, 232, 240);
            doc.rect(14, 32, 85, 28, 'F');
            doc.rect(14, 32, 85, 28, 'S');
            doc.setDrawColor(...riskColor);
            doc.setLineWidth(1);
            doc.line(14, 32, 14, 60);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...colorMuted);
            doc.text("HEALTH RISK STATUS", 18, 40);

            doc.setFontSize(12.5);
            doc.setTextColor(...riskColor);
            doc.text(riskLevel, 18, 50);

            // Score Card Y=32
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.rect(110, 32, 86, 28, 'F');
            doc.rect(110, 32, 86, 28, 'S');
            doc.setDrawColor(...colorPrimary);
            doc.setLineWidth(1);
            doc.line(110, 32, 110, 60);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...colorMuted);
            doc.text("DIAGNOSTIC RISK SCORE", 114, 40);

            doc.setFontSize(16);
            doc.setTextColor(...colorPrimary);
            doc.text(riskScore, 114, 50);

            // Insights Section Y=68
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...colorPrimary);
            doc.text("AI Diagnostic Insights", 14, 72);
            
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(14, 75, 196, 75);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...colorDark);
            const splitInsights = doc.splitTextToSize(riskInsights, 180);
            doc.text(splitInsights, 14, 82);

            // Recommendations Section Y=115
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...colorPrimary);
            doc.text("Personalized Health Recommendations", 14, 120);
            doc.line(14, 123, 196, 123);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...colorDark);

            const recsList = riskRecs.split('\n').filter(r => r.trim() !== '');
            let recsYPos = 130;
            recsList.forEach(rec => {
                const cleanRec = rec.replace(/^[\s•\-\*]+/, '');
                // draw bullet dot
                doc.setFillColor(...colorSecondary);
                doc.circle(18, recsYPos - 1.2, 1.2, 'F');
                doc.text(doc.splitTextToSize(cleanRec, 170), 24, recsYPos);
                recsYPos += 9;
            });

            // Generate PDF Blob with Forced Download Logic
            const pdfOutput = doc.output('arraybuffer');
            const blob = new Blob(
                [pdfOutput],
                { type: "application/pdf" }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "FitGenie_Health_Report.pdf";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                window.Toast.show("Fitness Report downloaded successfully.", "success");
            }, 600);
        } catch (err) {
            console.error("PDF generation failure:", err);
            window.Toast.show("Unable to generate PDF. Please try again.", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

// Hook PDF download button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('download-pdf-report-btn');
    if (btn) {
        btn.addEventListener('click', () => PDFModule.downloadPDF());
    }
});

// Bind globally
window.PDFModule = PDFModule;
