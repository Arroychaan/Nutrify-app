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

        // Bug #3 Fix: authApi.me() returns { success, data: {...} }
        // response.data is already unwrapped by axios → meRes = { success, data: { id, fullName, ... } }
        const userData = meRes?.data ?? meRes;
        if (userData?.fullName) {
          fullName = userData.fullName;
          streakDays = userData.streakDays || 0;
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
        
        const foodLogs = Array.isArray(todayFoodRes) ? todayFoodRes : (todayFoodRes?.logs ?? []);
        foodLogs.forEach((log: any) => {
          const mealType = log.mealType?.toLowerCase();
          if (mealType && meals[mealType as keyof typeof meals]) {
            meals[mealType as keyof typeof meals].push({
              id: log.id,
              name: log.foodName,
              cal: Number(log.calories || 0),
              protein: Number(log.proteinG || 0),
              carbs: Number(log.carbsG || 0),
              fat: Number(log.fatG || 0),
              price: 0,
              image: log.imageUrl || '',
              category: ''
            });
            caloriesConsumed += Number(log.calories || 0);
          }
        });

        // Parse transactions
        let budgetSpent = 0;
        const transactions: UserState['transactions'] = [];
        const txList = Array.isArray(todayTxRes) ? todayTxRes : (todayTxRes?.transactions ?? []);
        txList.forEach((tx: any) => {
          transactions.push({
            id: tx.id,
            date: new Date(tx.transactionDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
            name: tx.name,
            amount: Number(tx.amount),
            category: tx.category,
          });
          budgetSpent += Number(tx.amount);
        });

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

    // Bug #11 Fix: Added error handling + optimistic UI rollback
    addFoodToMeal: async (mealType, food) => {
      // Optimistic update first for snappy UX
      const optimisticFood = { ...food, id: food.id || `temp-${Date.now()}` };
      set((state) => ({
        meals: {
          ...state.meals,
          [mealType]: [...state.meals[mealType], optimisticFood],
        },
        caloriesConsumed: state.caloriesConsumed + optimisticFood.cal,
        budgetSpent: state.budgetSpent + optimisticFood.price,
      }));

      try {
        const res = await foodLogApi.create({
          mealType: mealType,
          foodName: food.name,
          calories: food.cal,
          proteinG: food.protein,
          carbsG: food.carbs,
          fatG: food.fat,
        });

        // Update temp id to real DB id
        const realId = res?.id || optimisticFood.id;
        set((state) => ({
          meals: {
            ...state.meals,
            [mealType]: state.meals[mealType].map((f) =>
              f.id === optimisticFood.id ? { ...f, id: realId } : f
            ),
          },
        }));
      } catch (error) {
        console.error('Failed to save food log:', error);
        // Rollback optimistic update on failure
        set((state) => ({
          meals: {
            ...state.meals,
            [mealType]: state.meals[mealType].filter((f) => f.id !== optimisticFood.id),
          },
          caloriesConsumed: Math.max(0, state.caloriesConsumed - optimisticFood.cal),
          budgetSpent: Math.max(0, state.budgetSpent - optimisticFood.price),
        }));
        throw error;
      }
    },

    removeFoodFromMeal: async (mealType, foodId) => {
      // Optimistic removal
      const currentMeal = get().meals[mealType];
      const foodToRemove = currentMeal.find(f => f.id === foodId);
      if (!foodToRemove) return;

      set((state) => ({
        meals: {
          ...state.meals,
          [mealType]: state.meals[mealType].filter(f => f.id !== foodId),
        },
        caloriesConsumed: Math.max(0, state.caloriesConsumed - foodToRemove.cal),
        budgetSpent: Math.max(0, state.budgetSpent - foodToRemove.price),
      }));

      try {
        await foodLogApi.delete(foodId);
      } catch (error) {
        console.error('Failed to delete food log:', error);
        // Rollback on failure
        set((state) => ({
          meals: {
            ...state.meals,
            [mealType]: [...state.meals[mealType], foodToRemove],
          },
          caloriesConsumed: state.caloriesConsumed + foodToRemove.cal,
          budgetSpent: state.budgetSpent + foodToRemove.price,
        }));
      }
    },

    addTransaction: async (name, amount, category) => {
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
