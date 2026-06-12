import os
import json
import random
from flask import Flask, render_template, jsonify, request

app = Flask(__name__, static_folder='static', template_folder='templates')

# Data stores
WORKOUT_DATABASE = {
    "Weight Loss": {
        "Home": {
            "Beginner": [
                {"name": "Bodyweight Squats", "sets": 3, "reps": "12 reps", "duration": "30s rest", "muscle": "Quads & Glutes", "desc": "Stand with feet shoulder-width, lower hips back and down."},
                {"name": "Incline Push-ups", "sets": 3, "reps": "10 reps", "duration": "45s rest", "muscle": "Chest & Arms", "desc": "Push-ups with hands elevated on a bed or study desk."},
                {"name": "Plank Hold", "sets": 3, "reps": "30-45s", "duration": "30s rest", "muscle": "Core", "desc": "Keep elbows under shoulders, hold body in straight line."},
                {"name": "Jumping Jacks", "sets": 3, "reps": "45s active", "duration": "30s rest", "muscle": "Cardio", "desc": "Standard jump and clap cardio movement."},
                {"name": "Glute Bridges", "sets": 3, "reps": "15 reps", "duration": "30s rest", "muscle": "Glutes & Hamstrings", "desc": "Lie on back, knees bent, lift hips to ceiling."},
                {"name": "Mountain Climbers", "sets": 3, "reps": "20 reps", "duration": "30s rest", "muscle": "Cardio & Core", "desc": "Drive knees alternately to chest in a push-up position."},
                {"name": "Reverse Lunges", "sets": 3, "reps": "12 reps", "duration": "30s rest", "muscle": "Legs & Balance", "desc": "Step backward and lower hips until back knee is near floor."},
                {"name": "Superman Hold", "sets": 3, "reps": "30 seconds", "duration": "30s rest", "muscle": "Lower Back & Core", "desc": "Lie face down, lift arms, chest, and legs off floor and hold."}
            ],
            "Intermediate": [
                {"name": "Jump Squats", "sets": 4, "reps": "15 reps", "duration": "30s rest", "muscle": "Explosive Legs", "desc": "Perform squat, jump explosively at the top."},
                {"name": "Standard Push-ups", "sets": 4, "reps": "12 reps", "duration": "45s rest", "muscle": "Chest, Shoulders & Triceps", "desc": "Hands slightly wider than shoulders, touch chest to floor."},
                {"name": "Mountain Climbers", "sets": 4, "reps": "45s active", "duration": "30s rest", "muscle": "Core & Cardio", "desc": "Drive knees alternately to chest in a push-up position."},
                {"name": "Reverse Lunges", "sets": 3, "reps": "12 reps/leg", "duration": "30s rest", "muscle": "Quads & Glutes", "desc": "Step backward and lower hips until back knee is near floor."},
                {"name": "Bicycle Crunches", "sets": 3, "reps": "20 reps total", "duration": "30s rest", "muscle": "Abs & Obliques", "desc": "Alternate touching elbow to opposite knee."},
                {"name": "Burpees", "sets": 3, "reps": "10 reps", "duration": "45s rest", "muscle": "Full Body & Cardio", "desc": "Perform a squat, jump back to push-up, jump forward, and jump high."},
                {"name": "Side Plank", "sets": 3, "reps": "30s hold", "duration": "30s rest", "muscle": "Obliques & Core", "desc": "Support body on one elbow and side of foot, keeping hips high."},
                {"name": "Single-Leg Glute Bridges", "sets": 3, "reps": "10 reps/leg", "duration": "30s rest", "muscle": "Glutes & Hamstrings", "desc": "Perform glute bridge with one leg extended straight."}
            ],
            "Advanced": [
                {"name": "Pistol Squats (Assisted)", "sets": 4, "reps": "8 reps/leg", "duration": "45s rest", "muscle": "Leg Strength", "desc": "One-legged squats holding onto a doorframe for balance."},
                {"name": "Decline Push-ups", "sets": 4, "reps": "12 reps", "duration": "45s rest", "muscle": "Upper Chest & Triceps", "desc": "Feet elevated on a chair or desk, hands on floor."},
                {"name": "Burpees", "sets": 4, "reps": "15 reps", "duration": "45s rest", "muscle": "Full Body Cardio", "desc": "Squat down, jump feet back, push-up, jump back up, jump vertically."},
                {"name": "Spiderman Plank", "sets": 4, "reps": "16 reps total", "duration": "30s rest", "muscle": "Core & Obliques", "desc": "Plank position, bring knee to same-side elbow."},
                {"name": "Single-Leg Glute Bridges", "sets": 3, "reps": "12 reps/leg", "duration": "30s rest", "muscle": "Glutes & Hamstrings", "desc": "Perform glute bridge with one leg extended straight."},
                {"name": "Handstand Push-ups (Wall Assisted)", "sets": 3, "reps": "8 reps", "duration": "60s rest", "muscle": "Shoulders & Triceps", "desc": "Perform vertical push-ups while in a handstand against a wall."},
                {"name": "Jump Lunges", "sets": 4, "reps": "10 reps/leg", "duration": "45s rest", "muscle": "Explosive Legs", "desc": "Lunge forward, then jump explosively and switch legs in mid-air."},
                {"name": "L-Sit Hold (Chair Assisted)", "sets": 3, "reps": "20s hold", "duration": "45s rest", "muscle": "Abs & Hip Flexors", "desc": "Support body on chair handles, lift legs straight out to form an L."}
            ]
        },
        "Gym": {
            "Beginner": [
                {"name": "Treadmill Walk/Jog", "sets": 1, "reps": "15 mins", "duration": "Incline 3%", "muscle": "Cardio", "desc": "Warm up jog at a conversational pace."},
                {"name": "Goblet Squats", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Quads & Glutes", "desc": "Hold a dumbbell or kettlebell vertically against your chest."},
                {"name": "Lat Pulldown", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Lats & Upper Back", "desc": "Pull the bar down to collarbone level."},
                {"name": "Dumbbell Chest Press", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Chest & Triceps", "desc": "Lying on flat bench, press dumbbells up."},
                {"name": "Hanging Knee Raises", "sets": 3, "reps": "12 reps", "duration": "45s rest", "muscle": "Lower Abs", "desc": "Hang from pull-up bar, tuck knees up to chest."},
                {"name": "Row Machine (Cardio)", "sets": 3, "reps": "5 mins", "duration": "60s rest", "muscle": "Full Body Cardio", "desc": "Row at moderate intensity, focusing on back pull and leg drive."},
                {"name": "Dumbbell Lunges", "sets": 3, "reps": "10 reps/leg", "duration": "60s rest", "muscle": "Quads & Glutes", "desc": "Hold dumbbells at sides, step forward and bend knees."},
                {"name": "Russian Twists (Weighted)", "sets": 3, "reps": "20 reps total", "duration": "45s rest", "muscle": "Obliques & Core", "desc": "Sit, lean back slightly, hold light dumbbell, twist side to side."}
            ],
            "Intermediate": [
                {"name": "Barbell Squats", "sets": 4, "reps": "8 reps", "duration": "90s rest", "muscle": "Legs & Core", "desc": "Squat deep with a barbell resting on your upper back."},
                {"name": "Seated Cable Row", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Mid Back & Biceps", "desc": "Pull handle towards lower ribs, squeezing shoulder blades."},
                {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10 reps", "duration": "75s rest", "muscle": "Upper Chest & Shoulders", "desc": "Perform bench press on a 30-45 degree incline bench."},
                {"name": "Leg Press Machine", "sets": 3, "reps": "12 reps", "duration": "75s rest", "muscle": "Quads & Calves", "desc": "Position feet hip-width, lower plate slowly, press back up."},
                {"name": "Plank Pull-Throughs", "sets": 3, "reps": "12 reps total", "duration": "45s rest", "muscle": "Core Stability", "desc": "In high plank, reach under chest and drag dumbbell across."},
                {"name": "Dumbbell Romanian Deadlifts (RDL)", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Hamstrings & Glutes", "desc": "Hinge at hips, lowering dumbbells along shins while keeping back flat."},
                {"name": "Kettlebell Swings", "sets": 3, "reps": "20 reps", "duration": "45s rest", "muscle": "Posterior Chain & Cardio", "desc": "Hinge hips back, snap forward to swing kettlebell to shoulder height."},
                {"name": "Elliptical Trainer", "sets": 1, "reps": "10 mins", "duration": "Mod intensity", "muscle": "Cardio", "desc": "Steady cardio to burn calories and warm up/cool down."}
            ],
            "Advanced": [
                {"name": "Barbell Back Squats", "sets": 4, "reps": "6 reps (heavy)", "duration": "120s rest", "muscle": "Lower Body", "desc": "Heavy squats focusing on form and deep range of motion."},
                {"name": "Barbell Deadlifts", "sets": 3, "reps": "5 reps", "duration": "120s rest", "muscle": "Posterior Chain", "desc": "Lift barbell from ground using legs, glutes, and back hinges."},
                {"name": "Weighted Pull-ups", "sets": 3, "reps": "8 reps", "duration": "90s rest", "muscle": "Lats & Biceps", "desc": "Pull-ups with dumbbell between ankles or belt weight."},
                {"name": "Overhead Press (OHP)", "sets": 3, "reps": "8 reps", "duration": "90s rest", "muscle": "Shoulders & Core", "desc": "Press barbell vertically overhead while standing."},
                {"name": "Cable Woodchoppers", "sets": 3, "reps": "12 reps/side", "duration": "45s rest", "muscle": "Obliques & Core", "desc": "Pull cable diagonally across body in a rotational motion."},
                {"name": "Thrusters (Barbell or DB)", "sets": 4, "reps": "10 reps", "duration": "75s rest", "muscle": "Full Body Power", "desc": "Front squat down, then press weight overhead explosively as you stand."},
                {"name": "Farmers Walk", "sets": 3, "reps": "50 meters", "duration": "60s rest", "muscle": "Grip & Core Stability", "desc": "Carry heavy dumbbells or kettlebells in hands and walk with tall posture."},
                {"name": "Hanging Leg Raises", "sets": 3, "reps": "12 reps", "duration": "45s rest", "muscle": "Core & Abs", "desc": "Hang from pull-up bar, raise feet all the way to touch the bar."}
            ]
        }
    },
    "Muscle Gain": {
        "Home": {
            "Beginner": [
                {"name": "Bodyweight Squats (Slow)", "sets": 3, "reps": "15 reps", "duration": "45s rest", "muscle": "Quads & Glutes", "desc": "Take 3 seconds down, 1 second up for maximum muscle tension."},
                {"name": "Push-ups (Knee or Full)", "sets": 3, "reps": "10-12 reps", "duration": "45s rest", "muscle": "Chest & Triceps", "desc": "Focus on driving elbows back at a 45-degree angle."},
                {"name": "Doorframe Pulls / Rows", "sets": 3, "reps": "12 reps", "duration": "45s rest", "muscle": "Upper Back & Biceps", "desc": "Hold onto a doorframe with hands, lean back and pull yourself forward."},
                {"name": "Chair Dips", "sets": 3, "reps": "10 reps", "duration": "45s rest", "muscle": "Triceps & Front Delts", "desc": "Hands on chair edge, slide off, bend elbows to lower body."},
                {"name": "Plank-to-Pushup", "sets": 3, "reps": "10 reps total", "duration": "45s rest", "muscle": "Core & Shoulders", "desc": "Transition from elbow plank to high push-up stance alternately."},
                {"name": "Glute Bridges", "sets": 3, "reps": "15 reps", "duration": "45s rest", "muscle": "Glutes & Hamstrings", "desc": "Lie on back, bend knees, lift hips to ceiling, squeeze glutes."},
                {"name": "Mountain Climbers", "sets": 3, "reps": "30s active", "duration": "30s rest", "muscle": "Core & Shoulders", "desc": "Drive knees alternately to chest in high plank position."},
                {"name": "Single-Leg Calf Raises", "sets": 3, "reps": "15 reps/leg", "duration": "30s rest", "muscle": "Calves", "desc": "Stand on one leg near wall for balance, raise up on toes."}
            ],
            "Intermediate": [
                {"name": "Bulgarian Split Squats", "sets": 3, "reps": "12 reps/leg", "duration": "60s rest", "muscle": "Quads, Glutes & Balance", "desc": "One foot back on a chair or bed, squat down on front leg."},
                {"name": "Diamond Push-ups", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Inner Chest & Triceps", "desc": "Push-ups with index fingers and thumbs touching in a diamond."},
                {"name": "Bed Sheet Pull-ups", "sets": 4, "reps": "8-10 reps", "duration": "60s rest", "muscle": "Back & Forearms", "desc": "Tie a knot in bed sheets, throw over a door, close door tight, pull up."},
                {"name": "Pike Push-ups", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Shoulders & Upper Chest", "desc": "Raise hips up in A-shape, bend elbows, lower head to ground."},
                {"name": "Prone Back Extensions", "sets": 3, "reps": "15 reps", "duration": "45s rest", "muscle": "Lower Back & Glutes", "desc": "Lying face down on stomach, lift chest and thighs off floor."},
                {"name": "Single-Leg Romanian Deadlifts", "sets": 3, "reps": "10 reps/leg", "duration": "60s rest", "muscle": "Hamstrings & Glutes", "desc": "Balance on one leg, hinge forward at hips, keeping back flat."},
                {"name": "Decline Push-ups", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Upper Chest & Triceps", "desc": "Elevate feet on a chair or bed, hands on floor."},
                {"name": "Towel Door Rows", "sets": 3, "reps": "8 reps", "duration": "60s rest", "muscle": "Lats & Biceps", "desc": "Wrap towel around door handle, sit back and pull chest to handle."}
            ],
            "Advanced": [
                {"name": "Pistol Squats", "sets": 4, "reps": "6-8 reps/leg", "duration": "60s rest", "muscle": "Single Leg Power", "desc": "Stand on one leg, squat down completely, press back up."},
                {"name": "Handstand Push-ups (Wall)", "sets": 3, "reps": "6 reps", "duration": "90s rest", "muscle": "Shoulders & Triceps", "desc": "Kick up against wall in handstand, lower head down, push back up."},
                {"name": "Archer Push-ups", "sets": 3, "reps": "8 reps/side", "duration": "60s rest", "muscle": "Unilateral Chest Strength", "desc": "Push-up keeping one arm straight and slide to opposite side."},
                {"name": "Single-Leg Bulgarian Jump Squats", "sets": 3, "reps": "10 reps/leg", "duration": "60s rest", "muscle": "Explosive Quads", "desc": "Bulgarian split squat with a jump at the top off front leg."},
                {"name": "Hollow Body Hold", "sets": 3, "reps": "45s hold", "duration": "45s rest", "muscle": "Core & Abs", "desc": "Lie on back, lift legs and upper shoulders, hold banana shape."},
                {"name": "Muscle-ups (Assisted)", "sets": 3, "reps": "5 reps", "duration": "90s rest", "muscle": "Upper Body Pull/Push", "desc": "Explosive pull-up transitioning into a dip at the top of the bar."},
                {"name": "Nordic Hamstring Curls (Assisted)", "sets": 3, "reps": "8 reps", "duration": "75s rest", "muscle": "Hamstrings", "desc": "Anchor ankles under heavy furniture, lower chest slowly to floor."},
                {"name": "L-Sit Hold", "sets": 3, "reps": "30s hold", "duration": "60s rest", "muscle": "Core & Hip Flexors", "desc": "Lift body off floor using hands, holding legs straight out parallel."}
            ]
        },
        "Gym": {
            "Beginner": [
                {"name": "Leg Press Machine", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Quads", "desc": "Slow eccentric contraction (3 seconds down) to build muscle."},
                {"name": "Dumbbell Bench Press", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Pectorals", "desc": "Keep shoulders retracted and flat against the bench."},
                {"name": "Seated Lat Pulldown", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Lats", "desc": "Focus on pulling with your elbows rather than biceps."},
                {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Deltoids", "desc": "Sit upright, press dumbbells from shoulder level to overhead."},
                {"name": "Standing Bicep Curls", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Biceps", "desc": "Curl dumbbells using standard grip, squeeze biceps at top."},
                {"name": "Lying Leg Curls", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Hamstrings", "desc": "Lying on machine, curl the pad toward glutes, control return."},
                {"name": "Tricep Pushdowns (Cable)", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Triceps", "desc": "Push rope or bar down, keeping elbows pinned to sides."},
                {"name": "Standing Calf Raises", "sets": 3, "reps": "15 reps", "duration": "60s rest", "muscle": "Calves", "desc": "Perform raises on calf machine, fully stretching and squeezing."}
            ],
            "Intermediate": [
                {"name": "Barbell Squats", "sets": 4, "reps": "8-10 reps", "duration": "90s rest", "muscle": "Lower Body", "desc": "Focus on progressive overload: increase weight if reps are comfortable."},
                {"name": "Barbell Flat Bench Press", "sets": 4, "reps": "8 reps", "duration": "90s rest", "muscle": "Chest & Triceps", "desc": "Maintain slight arch in lower back, feet flat on floor."},
                {"name": "Barbell Rows", "sets": 4, "reps": "10 reps", "duration": "75s rest", "muscle": "Mid Back & Rear Delts", "desc": "Bend at hips at a 45-degree angle, row bar to lower chest."},
                {"name": "Arnold Press", "sets": 3, "reps": "10 reps", "duration": "75s rest", "muscle": "Shoulders", "desc": "Start with palms facing you, rotate wrists as you press up."},
                {"name": "Skull Crushers (EZ Bar)", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Triceps", "desc": "Lying on bench, bend elbows to lower bar toward forehead."},
                {"name": "Romanian Deadlifts (RDL)", "sets": 3, "reps": "10 reps", "duration": "90s rest", "muscle": "Glutes & Hamstrings", "desc": "Lower barbell by pushing hips back, keeping bar close to legs."},
                {"name": "Incline Dumbbell Bench Press", "sets": 3, "reps": "10 reps", "duration": "90s rest", "muscle": "Upper Chest", "desc": "Press dumbbells up from a 30-degree incline bench."},
                {"name": "Cable Crossover (Chest Fly)", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Pectorals", "desc": "Bring cables together in front of chest in hugging motion."}
            ],
            "Advanced": [
                {"name": "Barbell Squat (Heavy)", "sets": 5, "reps": "5 reps", "duration": "120s rest", "muscle": "Quads & Glutes", "desc": "Focus on lifting heavy weight safely; use safety bars."},
                {"name": "Barbell Deadlift (Heavy)", "sets": 4, "reps": "5 reps", "duration": "120s rest", "muscle": "Posterior Chain", "desc": "Drive through heels, lock out glutes, keep spine neutral."},
                {"name": "Weighted Chest Dips", "sets": 4, "reps": "8 reps", "duration": "90s rest", "muscle": "Lower Chest & Triceps", "desc": "Dips on parallel bars holding a dumbbell or using a weight belt."},
                {"name": "Weighted Pull-ups", "sets": 4, "reps": "6-8 reps", "duration": "90s rest", "muscle": "Lats & Biceps", "desc": "Excellent pull exercise with overload plate weight."},
                {"name": "Incline Dumbbell Curls", "sets": 3, "reps": "10 reps", "duration": "60s rest", "muscle": "Bicep Long Head", "desc": "Bench set to 45 degrees, curl dumbbells from dead hang position."},
                {"name": "Incline Barbell Press", "sets": 4, "reps": "6-8 reps", "duration": "90s rest", "muscle": "Upper Chest & Shoulders", "desc": "Heavy barbell press on incline bench, focus on upper chest hypertrophy."},
                {"name": "Dumbbell Lateral Raises (Drop Set)", "sets": 3, "reps": "10 + 10 reps", "duration": "75s rest", "muscle": "Lateral Deltoids", "desc": "Raise dumbbells to sides, drop weight immediately and repeat reps."},
                {"name": "Cable Tricep Overhead Extensions", "sets": 3, "reps": "12 reps", "duration": "60s rest", "muscle": "Triceps Long Head", "desc": "Pull cable overhead from low pulley, extending elbows forward."}
            ]
        }
    }
}

# Fallbacks for other goals (Maintain / Athletic) map to Weight Loss or Muscle Gain with slight variation
WORKOUT_DATABASE["Maintain"] = WORKOUT_DATABASE["Weight Loss"]
WORKOUT_DATABASE["Athletic Performance"] = WORKOUT_DATABASE["Muscle Gain"]


DIET_DATABASE = {
    "Veg": {
        "Low": {
            "Breakfast": "Oatmeal with sliced banana, spoonful of peanut butter, and a glass of soy milk.",
            "Lunch": "Spiced brown lentils (dal) cooked with tomatoes, served over white or brown rice, with a side of cucumber slices.",
            "Dinner": "Tofu scramble with spinach, bell peppers, onions, served with two toasted whole wheat slices.",
            "Snacks": "A handful of roasted chickpeas or a banana with peanut butter.",
            "calories": 1950,
            "protein": "75g",
            "cost_index": "$",
            "budget_tips": "Buy dry lentils and oats in bulk. Store-brand peanut butter is cheap and provides excellent calorie-dense healthy fats."
        },
        "Medium": {
            "Breakfast": "Greek yogurt bowl with mixed berries, honey, chia seeds, and dynamic granola sprinkles.",
            "Lunch": "Quinoa salad with cubed paneer or tofu, roasted sweet potatoes, mixed greens, dressed with olive oil and lemon.",
            "Dinner": "Chickpea flour wraps (chillas) stuffed with seasoned cottage cheese, served with mint chutney and fresh steamed broccoli.",
            "Snacks": "Mixed nuts (almonds and walnuts) and an apple.",
            "calories": 2100,
            "protein": "90g",
            "cost_index": "$$",
            "budget_tips": "Buy Greek yogurt in large tubs rather than individual cups. Shop seasonal fruits for lower pricing."
        },
        "High": {
            "Breakfast": "Avocado toast on organic sourdough bread, topped with two poached eggs (if egg-vegetarian) or sautéed tempeh, plus a fresh fruit smoothie.",
            "Lunch": "High-protein plant-based meat alternative burger, sweet potato fries, roasted asparagus, and hemp-seed salad.",
            "Dinner": "Creamy coconut chickpea curry with paneer, edamame, and premium brown basmati rice, plus grilled zucchini.",
            "Snacks": "Premium protein bar, pumpkin seeds, and a vegan protein shake.",
            "calories": 2400,
            "protein": "110g",
            "cost_index": "$$$",
            "budget_tips": "Stock up on edamame and premium seeds from warehouse retailers to keep protein sources diverse."
        }
    },
    "Non-Veg": {
        "Low": {
            "Breakfast": "Three scrambled eggs cooked in a touch of oil, served with two slices of white/whole-wheat bread and a banana.",
            "Lunch": "Pan-seared chicken breast (budget bulk buy) served with seasoned white rice and steamed green beans.",
            "Dinner": "Canned tuna salad mixed with light mayo, celery, and onions, served over toasted flatbread.",
            "Snacks": "Two hard-boiled eggs with a pinch of black pepper.",
            "calories": 2000,
            "protein": "115g",
            "cost_index": "$",
            "budget_tips": "Buy chicken breasts in large family packs and freeze them. Canned tuna is a highly affordable, pure protein source."
        },
        "Medium": {
            "Breakfast": "Oatmeal cooked in milk, stirred with protein powder scoop, topped with sliced banana and almonds.",
            "Lunch": "Baked chicken breast marinated in herbs, roasted potatoes, and roasted broccoli drizzled with olive oil.",
            "Dinner": "Stir-fried lean ground beef or turkey with mixed frozen vegetables, served over egg noodles or jasmine rice.",
            "Snacks": "Cottage cheese with pineapple chunks, and a handful of almonds.",
            "calories": 2250,
            "protein": "130g",
            "cost_index": "$$",
            "budget_tips": "Buy frozen mixed vegetables; they are cheaper than fresh vegetables, last longer, and retain all nutrients."
        },
        "High": {
            "Breakfast": "Omelette with smoked salmon, baby spinach, feta cheese, served with sliced avocado and sourdough toast.",
            "Lunch": "Grilled ribeye steak or grilled salmon fillet, roasted asparagus, sweet potato mash, and a spinach-pomegranate salad.",
            "Dinner": "Shrimp stir-fry cooked in sesame oil with snap peas, baby corn, bell peppers, served over brown rice with avocado slices.",
            "Snacks": "Whey isolate protein shake with frozen berries, almond butter, and chia seeds.",
            "calories": 2500,
            "protein": "150g",
            "cost_index": "$$$",
            "budget_tips": "Look for fresh fish counters in late evenings for clearance markdowns on premium fillets."
        }
    }
}

# Add fallbacks for vegan / keto to avoid errors and support students
DIET_DATABASE["Vegan"] = {
    "Low": {
        "Breakfast": "Oatmeal with sliced banana, peanut butter, and soy milk.",
        "Lunch": "Spiced brown lentils (dal) served over brown rice with spinach.",
        "Dinner": "Tofu scramble with bell peppers, onions, spinach, and double whole wheat toast.",
        "Snacks": "Roasted chickpeas.",
        "calories": 1850,
        "protein": "70g",
        "cost_index": "$",
        "budget_tips": "Dry beans and soy beans are very cheap vegan staples. Buy in large bags."
    },
    "Medium": {
        "Breakfast": "Soy yogurt bowl with mixed berries, chia seeds, and granola.",
        "Lunch": "Quinoa salad with cubed seasoned tofu, sweet potatoes, and mixed baby greens.",
        "Dinner": "Tempeh stir-fry with broccoli, mushrooms, carrots, and peanut sauce over brown rice.",
        "Snacks": "Mixed nuts and an orange.",
        "calories": 2050,
        "protein": "85g",
        "cost_index": "$$",
        "budget_tips": "Make peanut sauce at home using peanut butter, soy sauce, and a squeeze of lime."
    },
    "High": {
        "Breakfast": "Avocado toast on organic sourdough topped with grilled tempeh, paired with a green hemp smoothie.",
        "Lunch": "Beyond Meat / Impossible burger, baked sweet potato wedges, and mixed greens salad with walnuts.",
        "Dinner": "Coconut chickpea and edamame curry served with organic brown basmati rice.",
        "Snacks": "Vegan protein shake with peanut butter and berries.",
        "calories": 2300,
        "protein": "105g",
        "cost_index": "$$$",
        "budget_tips": "Edamame is an excellent, protein-dense vegan option. Buy frozen bags."
    }
}

DIET_DATABASE["Keto"] = {
    "Low": {
        "Breakfast": "Three scrambled eggs cooked in butter with shredded cheddar cheese.",
        "Lunch": "Canned tuna salad made with full-fat mayonnaise, celery, and served in lettuce wraps.",
        "Dinner": "Pan-seared chicken thighs (skin-on, bone-in) with buttered steamed broccoli.",
        "Snacks": "Hard-boiled eggs or string cheese.",
        "calories": 1800,
        "protein": "110g",
        "cost_index": "$",
        "budget_tips": "Chicken thighs are much cheaper than chicken breasts and fit Keto macros perfectly due to higher fat content."
    },
    "Medium": {
        "Breakfast": "Omelette with bacon, spinach, and melted monterey jack cheese.",
        "Lunch": "Salad with grilled chicken breast, hard-boiled egg, bacon bits, blue cheese dressing, and avocado.",
        "Dinner": "Baked salmon fillet with a creamy garlic butter sauce, served with sautéed green beans.",
        "Snacks": "Macadamia nuts or pork rinds.",
        "calories": 2100,
        "protein": "125g",
        "cost_index": "$$",
        "budget_tips": "Buy block cheese and grate it yourself; pre-shredded cheese has starch coat and costs more."
    },
    "High": {
        "Breakfast": "Steak and eggs (sirloin steak seared in ghee, two eggs sunny side up), served with half an avocado.",
        "Lunch": "Lobster roll salad with butter-poached lobster claws, avocado, celery, and keto mayonnaise over spinach.",
        "Dinner": "Grilled ribeye steak with blue cheese butter, served with creamed spinach and grilled asparagus.",
        "Snacks": "Keto collagen protein shake with MCT oil and unsweetened almond milk.",
        "calories": 2400,
        "protein": "140g",
        "cost_index": "$$$",
        "budget_tips": "Buy grass-fed beef in bulk from local butchers or look for deals on family packs."
    }
}

# Health Risk Predictor endpoint defined below

# In-memory mock progress logger (can be customized)
MOCK_PROGRESS = {
    "streak": 5,
    "weights": [74.5, 74.2, 73.9, 73.8, 73.5],
    "bmis": [24.3, 24.2, 24.1, 24.1, 24.0],
    "dates": ["June 7", "June 8", "June 9", "June 10", "June 11"],
    "completed_workouts": 8
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/profile', methods=['POST'])
def process_profile():
    try:
        data = request.json
        weight = float(data.get('weight', 70))
        height = float(data.get('height', 175))
        age = int(data.get('age', 21))
        gender = data.get('gender', 'Male')
        activity = data.get('activity', 'Active')
        goal = data.get('goal', 'Weight Loss')
        
        # Calculate BMI
        height_m = height / 100.0
        bmi = round(weight / (height_m * height_m), 1)
        
        # Calculate BMR using Mifflin-St Jeor
        if gender == 'Male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
            
        # Calculate Maintenance Calories based on activity
        activity_multipliers = {
            "Sedentary": 1.2,
            "Light": 1.375,
            "Active": 1.55,
            "Extreme": 1.725
        }
        multiplier = activity_multipliers.get(activity, 1.55)
        maintenance_calories = int(bmr * multiplier)
        
        # Calculate Goal Calories
        if goal == 'Weight Loss':
            goal_calories = maintenance_calories - 500
        elif goal == 'Muscle Gain':
            goal_calories = maintenance_calories + 300
        else:
            goal_calories = maintenance_calories
            
        # Calculate Protein Requirement (g)
        # Weight loss/muscle gain need higher protein: ~1.8g to 2.2g per kg
        if goal in ['Weight Loss', 'Muscle Gain']:
            protein_req = int(weight * 2.0)
        else:
            protein_req = int(weight * 1.6)
            
        # Hydration (Liters)
        # Base water is weight in kg * 0.033. If active, add water.
        water_req = round((weight * 0.033) + (0.5 if activity in ['Active', 'Extreme'] else 0), 1)
        
        # Fitness Score Calculation (Custom heuristic out of 100)
        # Normal BMI yields high points, higher activity yields more, goal planning adds, etc.
        bmi_score = 30
        if 18.5 <= bmi <= 24.9:
            bmi_score = 30
        elif 25.0 <= bmi <= 29.9:
            bmi_score = 22
        else:
            bmi_score = 15
            
        activity_scores = {"Sedentary": 10, "Light": 20, "Active": 35, "Extreme": 40}
        act_score = activity_scores.get(activity, 30)
        
        # Age rating
        age_score = 30 if 18 <= age <= 25 else 25
        fitness_score = bmi_score + act_score + age_score
        fitness_score = min(fitness_score, 100)
        
        return jsonify({
            "success": True,
            "bmi": bmi,
            "bmr": int(bmr),
            "maintenance_calories": maintenance_calories,
            "goal_calories": goal_calories,
            "protein_req": protein_req,
            "water_req": water_req,
            "fitness_score": fitness_score
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/workout', methods=['POST'])
def generate_workout():
    try:
        data = request.json
        goal = data.get('goal', 'Weight Loss')
        mode = data.get('mode', 'Home')
        level = data.get('level', 'Beginner')
        
        # Safely extract from database
        goal_data = WORKOUT_DATABASE.get(goal, WORKOUT_DATABASE["Weight Loss"])
        mode_data = goal_data.get(mode, goal_data["Home"])
        exercises = mode_data.get(level, mode_data["Beginner"])
        
        return jsonify({
            "success": True,
            "workout_plan": exercises,
            "goal": goal,
            "mode": mode,
            "level": level
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/diet', methods=['POST'])
def generate_diet():
    try:
        data = request.json
        dietary_pref = data.get('dietary_pref', 'Veg')
        budget = data.get('budget', 'Low')
        
        # Match from database
        pref_data = DIET_DATABASE.get(dietary_pref, DIET_DATABASE["Veg"])
        diet_plan = pref_data.get(budget, pref_data["Low"])
        
        return jsonify({
            "success": True,
            "diet_plan": diet_plan,
            "dietary_pref": dietary_pref,
            "budget": budget
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/risk', methods=['POST'])
def process_risk():
    try:
        data = request.json
        weight = float(data.get('weight', 70))
        height = float(data.get('height', 175))
        age = int(data.get('age', 21))
        gender = data.get('gender', 'Male')
        activity = data.get('activity', 'Active')
        goal = data.get('goal', 'Weight Loss')
        
        # Calculate BMI
        height_m = height / 100.0
        bmi = round(weight / (height_m * height_m), 1)
        
        # Risk classification
        if bmi >= 30.0:
            risk_level = "Obesity Risk"
            risk_score = min(int(bmi * 2.5), 98)
            insights = (
                f"Your BMI of {bmi} indicates obesity. This is associated with increased workload on the heart, "
                "insulin resistance, and potential joint strain. Prioritizing consistent moderate exercise "
                "and a sustainable caloric deficit is highly recommended to improve cardiovascular markers."
            )
            recommendations = (
                "Focus on low-impact cardio (brisk walking, swimming) to protect joints.\n"
                "Incorporate strength training 3 times per week to preserve lean muscle mass.\n"
                "Emphasize whole foods, lean proteins, and fibrous vegetables to reduce daily caloric intake naturally.\n"
                "Aim for a safe and steady weight loss rate of 0.5 to 1 kg per week."
            )
        elif bmi >= 25.0:
            risk_level = "Overweight Risk"
            risk_score = min(int(bmi * 2.0), 74)
            insights = (
                f"Your BMI of {bmi} places you in the overweight category. This carries minor metabolic and "
                "cardiovascular risks, though physical performance can still remain high. Adjusting portion sizes "
                "and focusing on metabolic efficiency can help shift your body composition into a healthier range."
            )
            recommendations = (
                "Increase daily non-exercise physical activity (e.g., take the stairs, walk to lectures).\n"
                "Adopt a minor caloric deficit of 300-500 kcal relative to maintenance.\n"
                "Prioritize protein to aid satiety and help preserve muscle mass.\n"
                "Incorporate high-intensity interval training (HIIT) once or twice weekly."
            )
        elif bmi < 18.5:
            risk_level = "Underweight Risk"
            risk_score = min(int((18.5 - bmi) * 8 + 35), 70)
            insights = (
                f"Your BMI of {bmi} is in the underweight range. This can be linked to lower bone density, potential "
                "nutrient deficiencies, or a weakened immune response. Focusing on a nutrient-dense caloric surplus "
                "and resistance training to build muscle tissue is highly recommended."
            )
            recommendations = (
                "Consume calorie-dense healthy foods like nuts, avocados, peanut butter, and full-fat dairy.\n"
                "Aim for a daily caloric surplus of 300-500 kcal above maintenance.\n"
                "Focus on compound resistance exercises (squats, pushups, pulls) to promote lean muscle growth.\n"
                "Ensure adequate protein intake (~1.8g to 2.2g per kg of body weight)."
            )
        elif activity == "Sedentary":
            risk_level = "Sedentary Lifestyle Risk"
            risk_score = 45
            insights = (
                f"Even though your BMI of {bmi} is in the healthy range, your sedentary activity level poses "
                "risks such as reduced cardiovascular fitness, lower insulin sensitivity, and decreased metabolic rate. "
                "Adding consistent micro-movements throughout the day will significantly enhance your long-term health."
            )
            recommendations = (
                "Incorporate a 5-10 minute walking break for every 60-90 minutes of studying.\n"
                "Start with light bodyweight exercises at home (such as squats and wall pushups).\n"
                "Aim for at least 150 minutes of moderate-intensity activity per week.\n"
                "Monitor daily step counts, targeting a gradual increase to 8,000+ steps."
            )
        else:
            risk_level = "Healthy Range"
            risk_score = max(int((bmi - 18.5) * 2 + 10), 8)
            insights = (
                f"Your BMI of {bmi} and active lifestyle place you in the healthy range! This indicates excellent metabolic "
                "efficiency, low cardiovascular risk, and optimal physiological telemetry. Maintaining this balance will "
                "support both your physical wellness and academic cognitive stamina."
            )
            recommendations = (
                "Maintain your current balanced diet and activity level.\n"
                "Incorporate variety into your workouts to prevent plateaus and repetitive strain.\n"
                "Focus on quality sleep (7-8 hours) and hydration (3-4L) to optimize recovery.\n"
                "Continue tracking progress to stay aligned with your long-term wellness goal."
            )
            
        return jsonify({
            "success": True,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "insights": insights,
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/progress', methods=['GET', 'POST'])
def manage_progress():
    global MOCK_PROGRESS
    if request.method == 'POST':
        try:
            data = request.json
            new_weight = float(data.get('weight'))
            new_bmi = float(data.get('bmi'))
            date_str = data.get('date', 'Today')
            
            # Update data
            MOCK_PROGRESS["weights"].append(new_weight)
            MOCK_PROGRESS["bmis"].append(new_bmi)
            MOCK_PROGRESS["dates"].append(date_str)
            MOCK_PROGRESS["streak"] += 1
            
            # Limit arrays to last 7 entries for clean chart rendering
            if len(MOCK_PROGRESS["weights"]) > 7:
                MOCK_PROGRESS["weights"] = MOCK_PROGRESS["weights"][-7:]
                MOCK_PROGRESS["bmis"] = MOCK_PROGRESS["bmis"][-7:]
                MOCK_PROGRESS["dates"] = MOCK_PROGRESS["dates"][-7:]
                
            return jsonify({
                "success": True,
                "progress": MOCK_PROGRESS
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400
    else:
        return jsonify({
            "success": True,
            "progress": MOCK_PROGRESS
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
