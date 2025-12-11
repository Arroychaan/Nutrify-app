#!/usr/bin/env python3
"""
Script untuk mengkonversi nutrition.csv menjadi SQL INSERT statements
untuk tabel local_foods di Nutrify database.

Jalankan: python csv_to_sql.py
Output: import_nutrition_full.sql
"""

import csv
import re

# Kategori berdasarkan keyword dalam nama makanan
def get_category(name):
    name_lower = name.lower()
    
    # Fruits
    fruits = ['apel', 'alpukat', 'anggur', 'arbei', 'belimbing', 'buah', 'ceri', 'duku', 
              'durian', 'jambu', 'jeruk', 'kelapa', 'lemon', 'mangga', 'manggis', 'melon',
              'nanas', 'nangka', 'pepaya', 'pisang', 'rambutan', 'salak', 'sawo', 'semangka',
              'sirsak', 'stroberi', 'kurma', 'kedondong', 'kesemek', 'markisa', 'matoa',
              'langsat', 'lontar', 'duwet', 'gandaria', 'cempedak', 'menteng', 'kokosan']
    
    # Vegetables
    vegetables = ['bayam', 'brokoli', 'buncis', 'kacang panjang', 'kangkung', 'kol', 'kubis',
                  'labu', 'lobak', 'oyong', 'gambas', 'pare', 'paria', 'sawi', 'selada',
                  'tauge', 'toge', 'terong', 'tomat', 'wortel', 'ketimun', 'timun', 'daun',
                  'jamur', 'paprika', 'rebung', 'genjer', 'pakis', 'petai', 'pete', 'jengkol',
                  'leunca', 'kenikir', 'kemangi', 'kucai', 'bawang', 'seledri', 'kembang']
    
    # Proteins (meat, fish, eggs)
    proteins = ['ayam', 'sapi', 'kambing', 'domba', 'babi', 'daging', 'ikan', 'udang', 
                'cumi', 'kepiting', 'kerang', 'telur', 'bebek', 'itik', 'burung', 'kodok',
                'katak', 'belut', 'lele', 'gurame', 'mujair', 'nila', 'patin', 'bandeng',
                'tongkol', 'tuna', 'salmon', 'cakalang', 'teri', 'rebon', 'rajungan',
                'tempe', 'tahu', 'oncom', 'kedelai', 'kacang tanah', 'kacang merah',
                'kacang hijau', 'kacang', 'hati', 'ginjal', 'usus', 'babat', 'otak',
                'lidah', 'paru', 'jeroan', 'dendeng', 'abon', 'asin', 'pindang', 'peda']
    
    # Grains & carbs
    grains = ['beras', 'nasi', 'jagung', 'gandum', 'tepung', 'roti', 'mie', 'mi ', 
              'spaghetti', 'makaroni', 'singkong', 'ubi', 'kentang', 'talas', 'sagu',
              'ketupat', 'lontong', 'bubur', 'havermut', 'oat', 'gaplek', 'tiwul']
    
    # Prepared dishes
    dishes = ['rendang', 'gulai', 'soto', 'rawon', 'bakso', 'sate', 'pecel', 'gado',
              'nasi goreng', 'mie goreng', 'capcai', 'cap cai', 'lodeh', 'sayur asem',
              'sup', 'sop', 'opor', 'balado', 'tumis', 'goreng', 'bakar', 'panggang',
              'pepes', 'pempek', 'siomay', 'batagor', 'martabak', 'lumpia', 'risoles',
              'pastel', 'kroket', 'perkedel', 'gudeg', 'tongseng', 'semur', 'kare',
              'masakan', 'hidangan']
    
    # Snacks & desserts
    snacks = ['kue', 'kerupuk', 'keripik', 'rempeyek', 'onde', 'klepon', 'kelepon',
              'getuk', 'dodol', 'wajik', 'serabi', 'putu', 'lapis', 'bolu', 'cake',
              'biskuit', 'cookies', 'roti', 'permen', 'coklat', 'es krim', 'kolak',
              'tape', 'tapai', 'jenang', 'cemilan', 'camilan', 'pisang goreng']
    
    # Dairy
    dairy = ['susu', 'keju', 'yoghurt', 'yogurt', 'mentega', 'krim', 'cream']
    
    # Spices & condiments
    spices = ['jahe', 'kunyit', 'lengkuas', 'laos', 'sereh', 'serai', 'kemiri',
              'ketumbar', 'jintan', 'merica', 'lada', 'cabe', 'cabai', 'sambal',
              'kecap', 'terasi', 'petis', 'tauco', 'bumbu', 'rempah', 'garam', 'gula']
    
    # Check categories
    for keyword in fruits:
        if keyword in name_lower:
            return 'fruits'
    
    for keyword in dairy:
        if keyword in name_lower:
            return 'dairy'
    
    for keyword in spices:
        if keyword in name_lower:
            return 'spices'
    
    for keyword in snacks:
        if keyword in name_lower:
            return 'snacks'
    
    for keyword in dishes:
        if keyword in name_lower:
            return 'prepared_dishes'
    
    for keyword in proteins:
        if keyword in name_lower:
            return 'proteins'
    
    for keyword in vegetables:
        if keyword in name_lower:
            return 'vegetables'
    
    for keyword in grains:
        if keyword in name_lower:
            return 'grains'
    
    return 'other'

def is_vegetarian(name, category):
    """Cek apakah makanan vegetarian"""
    name_lower = name.lower()
    non_veg = ['ayam', 'sapi', 'kambing', 'domba', 'babi', 'daging', 'ikan', 'udang', 
               'cumi', 'kepiting', 'kerang', 'bebek', 'itik', 'burung', 'kodok', 'katak',
               'belut', 'lele', 'gurame', 'mujair', 'nila', 'patin', 'bandeng', 'tongkol',
               'tuna', 'salmon', 'cakalang', 'teri', 'rebon', 'rajungan', 'hati', 'ginjal',
               'usus', 'babat', 'otak', 'lidah', 'paru', 'jeroan', 'dendeng', 'abon',
               'telur', 'penyu', 'anjing', 'kuda', 'kerbau', 'kelinci', 'rusa', 'menjangan']
    
    for keyword in non_veg:
        if keyword in name_lower:
            return False
    
    return True

def is_vegan(name, category):
    """Cek apakah makanan vegan"""
    if not is_vegetarian(name, category):
        return False
    
    name_lower = name.lower()
    non_vegan = ['telur', 'susu', 'keju', 'mentega', 'krim', 'yoghurt', 'yogurt', 
                 'cream', 'santan']  # santan actually vegan, keeping for accuracy
    
    # Remove santan from non-vegan list as it's plant-based
    non_vegan = ['telur', 'susu', 'keju', 'mentega', 'krim', 'yoghurt', 'yogurt', 'cream']
    
    for keyword in non_vegan:
        if keyword in name_lower:
            return False
    
    return True

def estimate_fiber(name, category, carbs):
    """Estimasi serat berdasarkan kategori"""
    if category == 'vegetables':
        return min(round(carbs * 0.3, 1), 5)
    elif category == 'fruits':
        return min(round(carbs * 0.15, 1), 4)
    elif category == 'grains':
        if 'beras merah' in name.lower() or 'gandum' in name.lower():
            return min(round(carbs * 0.1, 1), 6)
        return round(carbs * 0.03, 1)
    elif category == 'proteins':
        if 'kacang' in name.lower() or 'tempe' in name.lower():
            return min(round(carbs * 0.2, 1), 5)
        return 0
    return 0

def estimate_sodium(name, category):
    """Estimasi sodium berdasarkan nama"""
    name_lower = name.lower()
    
    # High sodium foods
    if any(x in name_lower for x in ['asin', 'garam', 'kecap', 'terasi', 'petis', 
                                      'sambal', 'mie instan', 'kerupuk', 'dendeng',
                                      'pindang', 'peda', 'abon', 'kornet', 'sosis']):
        return 800
    elif any(x in name_lower for x in ['goreng', 'tumis', 'bakar', 'masakan']):
        return 300
    elif category in ['fruits', 'vegetables']:
        return 5
    elif category == 'proteins':
        return 60
    return 50

def estimate_sugar(name, category, carbs):
    """Estimasi gula berdasarkan kategori"""
    name_lower = name.lower()
    
    if any(x in name_lower for x in ['gula', 'manis', 'selai', 'sirup', 'madu', 
                                      'dodol', 'wajik', 'kolak', 'es krim']):
        return min(round(carbs * 0.5, 1), 30)
    elif category == 'fruits':
        return min(round(carbs * 0.6, 1), 15)
    elif category == 'snacks':
        return min(round(carbs * 0.3, 1), 20)
    elif category == 'vegetables':
        return round(carbs * 0.1, 1)
    return 0

def get_benefits(name, category, protein, carbs, fat):
    """Generate benefits berdasarkan nutrisi"""
    benefits = []
    name_lower = name.lower()
    
    # High protein
    if protein >= 15:
        benefits.append('Protein tinggi')
    elif protein >= 8:
        benefits.append('Sumber protein')
    
    # High fiber vegetables
    if category == 'vegetables':
        benefits.append('Rendah kalori')
        if 'daun' in name_lower:
            benefits.append('Kaya vitamin')
    
    # Fruits
    if category == 'fruits':
        benefits.append('Kaya vitamin')
        if any(x in name_lower for x in ['jeruk', 'jambu', 'mangga']):
            benefits.append('Vitamin C tinggi')
    
    # Carb sources
    if category == 'grains' and carbs >= 30:
        benefits.append('Sumber karbohidrat')
    
    # Healthy fats
    if any(x in name_lower for x in ['salmon', 'tuna', 'kacang', 'alpukat']):
        benefits.append('Lemak sehat')
    
    # Traditional foods
    if any(x in name_lower for x in ['tempe', 'tahu', 'oncom']):
        benefits.append('Protein nabati')
    
    if not benefits:
        benefits.append('Sumber energi')
    
    return benefits[:3]  # Max 3 benefits

def get_preparations(name, category):
    """Generate preparation methods"""
    name_lower = name.lower()
    preps = []
    
    if 'goreng' in name_lower:
        preps.append('Goreng')
    if 'rebus' in name_lower or 'kukus' in name_lower:
        preps.append('Rebus/Kukus')
    if 'bakar' in name_lower or 'panggang' in name_lower:
        preps.append('Bakar')
    if 'tumis' in name_lower:
        preps.append('Tumis')
    
    if not preps:
        if category == 'fruits':
            preps = ['Dimakan langsung', 'Jus']
        elif category == 'vegetables':
            preps = ['Tumis', 'Rebus']
        elif category == 'proteins':
            preps = ['Goreng', 'Bakar']
        elif category == 'grains':
            preps = ['Nasi/Bubur']
        elif category == 'snacks':
            preps = ['Cemilan']
        else:
            preps = ['Dimasak']
    
    return preps[:2]

def escape_sql(text):
    """Escape single quotes for SQL"""
    return text.replace("'", "''")

def main():
    input_file = '../../nutrition.csv'
    output_file = 'import_nutrition_full.sql'
    
    sql_lines = []
    sql_lines.append('-- ============================================')
    sql_lines.append('-- NUTRIFY - Complete Indonesian Food Database')
    sql_lines.append('-- Auto-generated from nutrition.csv')
    sql_lines.append('-- Total: 1346 Indonesian Foods')
    sql_lines.append('-- Column names use camelCase to match Prisma schema')
    sql_lines.append('-- ============================================')
    sql_lines.append('')
    sql_lines.append('-- Truncate existing data (optional - uncomment if needed)')
    sql_lines.append('-- TRUNCATE TABLE local_foods RESTART IDENTITY CASCADE;')
    sql_lines.append('')
    sql_lines.append('-- Insert all foods')
    sql_lines.append('INSERT INTO local_foods (')
    sql_lines.append('  id, name, category, origin, calories, "proteinG", "carbsG", "fatG",')
    sql_lines.append('  "fiberG", "sodiumMg", "sugarG", "isVegetarian", "isVegan", "isHalal",')
    sql_lines.append('  benefits, "commonPreparations", "createdAt", "updatedAt"')
    sql_lines.append(') VALUES')
    
    values = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        
        for row in reader:
            try:
                food_id = row[0]
                calories = float(row[1]) if row[1] else 0
                protein = float(row[2]) if row[2] else 0
                fat = float(row[3]) if row[3] else 0
                carbs = float(row[4]) if row[4] else 0
                name = row[5].strip() if len(row) > 5 else f'Unknown Food {food_id}'
                
                # Clean name
                name = re.sub(r'\s+', ' ', name)  # Remove extra spaces
                name = name.strip()
                
                category = get_category(name)
                is_veg = is_vegetarian(name, category)
                is_vgn = is_vegan(name, category)
                
                # Estimations
                fiber = estimate_fiber(name, category, carbs)
                sodium = estimate_sodium(name, category)
                sugar = estimate_sugar(name, category, carbs)
                
                benefits = get_benefits(name, category, protein, carbs, fat)
                preps = get_preparations(name, category)
                
                # Format arrays for PostgreSQL
                benefits_sql = "ARRAY[" + ", ".join([f"'{escape_sql(b)}'" for b in benefits]) + "]"
                preps_sql = "ARRAY[" + ", ".join([f"'{escape_sql(p)}'" for p in preps]) + "]"
                
                value = f"(gen_random_uuid(), '{escape_sql(name)}', '{category}', 'Indonesia', {calories}, {protein}, {carbs}, {fat}, {fiber}, {sodium}, {sugar}, {str(is_veg).lower()}, {str(is_vgn).lower()}, true, {benefits_sql}, {preps_sql}, NOW(), NOW())"
                values.append(value)
                
            except Exception as e:
                print(f"Error processing row {row}: {e}")
                continue
    
    # Join all values with commas
    sql_lines.append(',\n'.join(values))
    
    # Add ON CONFLICT clause
    sql_lines.append('')
    sql_lines.append('ON CONFLICT (name) DO UPDATE SET')
    sql_lines.append('  calories = EXCLUDED.calories,')
    sql_lines.append('  "proteinG" = EXCLUDED."proteinG",')
    sql_lines.append('  "carbsG" = EXCLUDED."carbsG",')
    sql_lines.append('  "fatG" = EXCLUDED."fatG",')
    sql_lines.append('  "fiberG" = EXCLUDED."fiberG",')
    sql_lines.append('  "sodiumMg" = EXCLUDED."sodiumMg",')
    sql_lines.append('  "sugarG" = EXCLUDED."sugarG",')
    sql_lines.append('  "updatedAt" = NOW();')
    sql_lines.append('')
    sql_lines.append('-- Verify import')
    sql_lines.append('SELECT COUNT(*) as total_foods FROM local_foods;')
    sql_lines.append("SELECT category, COUNT(*) as count FROM local_foods GROUP BY category ORDER BY count DESC;")
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"✅ Generated {output_file} with {len(values)} food items!")
    print(f"📊 Categories breakdown will be shown after import")

if __name__ == '__main__':
    main()
