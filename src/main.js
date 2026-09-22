/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
const calculateRevenue = function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции

   const { discount, sale_price, quantity } = purchase;
   const  discountCoefficient = 1 - (discount / 100);
   const revenue = sale_price * quantity * discountCoefficient;
   return revenue
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
const calculateBonus = function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
   
    const { profit } = seller;
    if (index === 0) {
       const bonus = seller.profit * 0.15;
        return bonus
    }
    else if (index === 1 || index === 2) {
        const bonus = seller.profit * 0.10;
        return bonus
    }
    else if (index === total-1) {
        const bonus = seller.profit * 0;
        return bonus
    } else {
        const bonus = seller.profit * 0.05;
        return bonus
    }
}

const calculateSimpleRevenue = calculateRevenue;
const calculateBonusByProfit = calculateBonus;

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных

    if (!data
    || !Array.isArray(data.sellers)
    || !Array.isArray(data.purchase_records)
    || !Array.isArray(data.products)
    || data.sellers.length === 0
    || data.purchase_records.length === 0
    || data.products.length === 0
) {
    throw new Error('Некорректные входные данные');
};

    // @TODO: Проверка наличия опций

    if(typeof options !== "object" 
    || options === null
    ) {
        throw new Error('Options не является объектом');
    }
    if (typeof options.calculateRevenue !== "function" 
    || typeof options.calculateBonus !== "function" 
    ) {
        throw new Error('Переменные не являются функциями');
    };
    const { calculateRevenue, calculateBonus } = options;

    // @TODO: Подготовка промежуточных данных для сбора статистики

    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    })); 

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    const sellerIndex =  Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));
    const productIndex =  Object.fromEntries(data.products.map(prod => [prod.sku, prod]));

    // @TODO: Расчет выручки и прибыли для каждого продавца

    data.purchase_records.forEach(record => { 
        const seller = sellerIndex[record.seller_id];
        if(!seller) return;
        if(!seller.products_sold) {
            seller.products_sold = {};
        }
            seller.sales_count += 1;
            seller.revenue += record.total_amount;
        
        record.items.forEach(item => {
            const product = productIndex[item.sku]; 
            if (!product) return;
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateRevenue(item, product);
            const profit = revenue - cost;
            seller.profit += profit;
            if (!seller.products_sold[item.sku]) {
            seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity; 
        })
    });

    // @TODO: Сортировка продавцов по прибыли

    sellerStats.sort((a, b) => b.profit - a.profit);
    
    // @TODO: Назначение премий на основе ранжирования

    sellerStats.forEach((seller, index) => {
        const total = sellerStats.length;
        seller.bonus = calculateBonus(index, total, seller);
        
        const newProductsSold = Object.entries(seller.products_sold).map(([sku, quantity]) => ({sku, quantity}));
        newProductsSold.sort((a, b) => b.quantity - a.quantity);
        seller.top_products = newProductsSold.slice(0, 10);
    })

    // @TODO: Подготовка итоговой коллекции с нужными полями

    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2),
    })); 

}
