import { create } from 'zustand'
import { authApi, foodLogApi, transactionsApi, userTargetsApi } from './api'

export interface FoodItem {
  id: string;
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image: string;
  category: string;
}

export interface UserState {
  fullName: string;
  dailyCalorieTarget: number;
  dailyBudget: number;
  caloriesConsumed: number;
  budgetSpent: number;
  streakDays: number;
  meals: {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
  };
  transactions: {
    id: string;
    date: string;
    name: string;
    amount: number;
    category: string;
  }[];
  // Actions
  fetchInitialData: () => Promise<void>;
  addFoodToMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', food: FoodItem) => Promise<void>;
  removeFoodFromMeal: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', foodId: string) => Promise<void>;
  addTransaction: (name: string, amount: number, category: string) => Promise<void>;
  resetDaily: () => void;
}

export const useAppStore = create<UserState>()(
  (set, get) => ({
    fullName: 'Sahabat Nusantara', // Fallback, will be updated by auth
    dailyCalorieTarget: 1800,
    dailyBudget: 50000,
    caloriesConsumed: 0,
    budgetSpent: 0,
    streakDays: 0,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    transactions: [],

    fetchInitialData: async () => {
      try {
        const [meRes, targetsRes, todayFoodRes, todayTxRes] = await Promise.all([
          authApi.me().catch(() => null),
          userTargetsApi.get().catch(() => null),
          foodLogApi.getTodaySummary().catch(() => null),
          transactionsApi.getToday().catch(() => null)
        ]);

        let fullName = get().fullName;
        let streakDays = 0;
        if (meRes?.data) {
          fullName = meRes.data.fullName || fullName;
          streakDays = meRes.data.streakDays || 0;
        }

        let dailyCalorieTarget = 1800;
        let dailyBudget = 50000;
        if (targetsRes) {
          dailyCalorieTarget = targetsRes.dailyCalorieTarget ?? 1800;
          dailyBudget = targetsRes.dailyBudget ?? 50000;
        }

        // Parse food logs into meals
        const meals = { breakfast: [], lunch: [], dinner: [], snacks: [] } as UserState['meals'];
        let caloriesConsumed = 0;
        
        if (todayFoodRes && Array.isArray(todayFoodRes)) {
          todayFoodRes.forEach((log: any) => {
            const mealType = log.mealType.toLowerCase();
            if (meals[mealType as keyof typeof meals]) {
              meals[mealType as keyof typeof meals].push({
                id: log.id,
                name: log.foodName,
                cal: Number(log.calories || 0),
                protein: Number(log.proteinG || 0),
                carbs: Number(log.carbsG || 0),
                fat: Number(log.fatG || 0),
                price: 0, // Not directly stored in foodLogs
                image: log.imageUrl || '',
                category: ''
              });
              caloriesConsumed += Number(log.calories || 0);
            }
          });
        }

        // Parse transactions
        let budgetSpent = 0;
        const transactions: UserState['transactions'] = [];
        if (todayTxRes && Array.isArray(todayTxRes)) {
          todayTxRes.forEach((tx: any) => {
            transactions.push({
              id: tx.id,
              date: new Date(tx.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
              name: tx.name,
              amount: Number(tx.amount),
              category: tx.category,
            });
            budgetSpent += Number(tx.amount);
          });
        }

        set({
          fullName,
          streakDays,
          dailyCalorieTarget,
          dailyBudget,
          meals,
          caloriesConsumed,
          transactions,
          budgetSpent,
        });

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    },

    addFoodToMeal: async (mealType, food) => {
      // Pessimistic update: Call API first
      const res = await foodLogApi.create({
        mealType: mealType,
        foodName: food.name,
        calories: food.cal,
        proteinG: food.protein,
        carbsG: food.carbs,
        fatG: food.fat,
      });

      // Update ID to the real DB id if available
      const realId = res?.id || food.id;
      const updatedFood = { ...food, id: realId };

      // Then update local state
      set((state) => ({
        meals: {
          ...state.meals,
          [mealType]: [...state.meals[mealType], updatedFood],
        },
        caloriesConsumed: state.caloriesConsumed + updatedFood.cal,
        budgetSpent: state.budgetSpent + updatedFood.price,
      }));
    },

    removeFoodFromMeal: async (mealType, foodId) => {
      // API call first
      await foodLogApi.delete(foodId);
      
      set((state) => {
        const mealList = state.meals[mealType];
        const foodToRemove = mealList.find(f => f.id === foodId);
        if (!foodToRemove) return state;

        return {
          meals: {
            ...state.meals,
            [mealType]: mealList.filter(f => f.id !== foodId),
          },
          caloriesConsumed: Math.max(0, state.caloriesConsumed - foodToRemove.cal),
          budgetSpent: Math.max(0, state.budgetSpent - foodToRemove.price),
        }
      })
    },

    addTransaction: async (name, amount, category) => {
      // API call first
      const tx = await transactionsApi.create({ name, amount, category });
      
      set((state) => {
        const newTransaction = {
          id: tx?.id || Date.now().toString(),
          date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
          name,
          amount,
          category,
        };
        return {
          transactions: [newTransaction, ...state.transactions],
          budgetSpent: state.budgetSpent + amount,
        }
      })
    },

    resetDaily: () => set({
      caloriesConsumed: 0,
      budgetSpent: 0,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      transactions: [],
    }),
  })
)
