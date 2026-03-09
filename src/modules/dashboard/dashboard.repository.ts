import { DbClient } from "@src/modules/users/users.repository";

export interface SoldOrderSummary {
  id: string;
  user_id: string;
  total_price: string;
  discount_amount: string;
  final_total: string;
  status: string;
  created_at: string;
}

export interface TopSellingTreeSummary {
  tree_id: string;
  tree_name: string;
  species: string;
  sold_quantity: number;
  sales_amount: string;
}

export interface SalesMonthlyItem {
  month: string;
  label: string;
  sales_amount: number;
}

export interface SalesWeeklyItem {
  day: string;
  label: string;
  sales_amount: number;
}

export interface DashboardSummary {
  total_tree_types: number;
  total_trees: number;
  stock_value_sell_price: string;
  stock_value_buy_price: string;
  stock_profit_value: string;
  total_sales_from_orders: string;
  sold_orders_count: number;
  sold_orders: SoldOrderSummary[];
  top_selling_trees: TopSellingTreeSummary[];
  sales_monthly: SalesMonthlyItem[];
  sales_weekly: SalesWeeklyItem[];
}

export class DashboardRepository {
  constructor(private readonly db: DbClient) {}

  async getSummary(
    fromDate?: string,
    toDate?: string,
  ): Promise<DashboardSummary> {
    const params: unknown[] = [];
    const conditions: string[] = [];
    const orderDateConditions: string[] = [];
    let paramIndex = 0;

    if (fromDate) {
      params.push(fromDate);
      paramIndex += 1;
      conditions.push(`created_at >= $${params.length}::date`);
      orderDateConditions.push(`o.created_at >= $${paramIndex}::date`);
    }
    if (toDate) {
      params.push(toDate);
      paramIndex += 1;
      conditions.push(
        `created_at < ($${params.length}::date + INTERVAL '1 day')`,
      );
      orderDateConditions.push(
        `o.created_at < ($${paramIndex}::date + INTERVAL '1 day')`,
      );
    }

    const whereSql =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const ordersWhereSql =
      orderDateConditions.length > 0
        ? `WHERE ${orderDateConditions.join(" AND ")}`
        : "";

    const stockResult = await this.db.query<{
      total_tree_types: number;
      total_trees: number;
      stock_value_sell_price: string;
      stock_value_buy_price: string;
      stock_profit_value: string;
    }>(
      `
      SELECT
        COALESCE(COUNT(DISTINCT species), 0)::int AS total_tree_types,
        COALESCE(SUM(quantity), 0)::int AS total_trees,
        COALESCE(SUM(quantity * sell_price), 0)::numeric(12, 2)::text AS stock_value_sell_price,
        COALESCE(SUM(quantity * buy_price), 0)::numeric(12, 2)::text AS stock_value_buy_price,
        COALESCE(SUM(quantity * (sell_price - buy_price)), 0)::numeric(12, 2)::text AS stock_profit_value
      FROM trees
      WHERE status = 'active'
      `,
    );

    const salesResult = await this.db.query<{
      total_sales_from_orders: string;
    }>(
      `
      SELECT
        COALESCE(SUM(final_total), 0)::numeric(12, 2)::text AS total_sales_from_orders
      FROM orders
      ${whereSql}
      `,
      params,
    );

    const ordersResult = await this.db.query<SoldOrderSummary>(
      `
      SELECT
        id,
        user_id,
        total_price::text,
        discount_amount::text,
        final_total::text,
        status,
        created_at::text
      FROM orders
      ${whereSql}
      ORDER BY created_at DESC
      `,
      params,
    );

    const topSellingTreesResult = await this.db.query<TopSellingTreeSummary>(
      `
      SELECT
        oi.tree_id,
        oi.tree_name,
        COALESCE(t.species, '-') AS species,
        COALESCE(SUM(oi.quantity), 0)::int AS sold_quantity,
        COALESCE(SUM(oi.subtotal), 0)::numeric(12, 2)::text AS sales_amount
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      LEFT JOIN trees t ON t.id = oi.tree_id
      ${ordersWhereSql}
      GROUP BY oi.tree_id, oi.tree_name, t.species
      ORDER BY sold_quantity DESC, sales_amount DESC
      LIMIT 5
      `,
      params,
    );

    const monthlyRaw = await this.db.query<{
      month: string;
      month_no: number;
      sales_amount: number;
    }>(
      `
      SELECT
        to_char(ms.month_start, 'YYYY-MM') AS month,
        EXTRACT(MONTH FROM ms.month_start)::int AS month_no,
        COALESCE(SUM(o.final_total), 0)::double precision AS sales_amount
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS ms(month_start)
      LEFT JOIN orders o
        ON date_trunc('month', o.created_at) = ms.month_start
      GROUP BY ms.month_start
      ORDER BY ms.month_start
      `
    );

    const monthLabels: Record<number, string> = {
      1: "ม.ค.",
      2: "ก.พ.",
      3: "มี.ค.",
      4: "เม.ย.",
      5: "พ.ค.",
      6: "มิ.ย.",
      7: "ก.ค.",
      8: "ส.ค.",
      9: "ก.ย.",
      10: "ต.ค.",
      11: "พ.ย.",
      12: "ธ.ค.",
    };

    const salesMonthly: SalesMonthlyItem[] = monthlyRaw.rows.map((row) => ({
      month: row.month,
      label: monthLabels[row.month_no] ?? row.month,
      sales_amount: row.sales_amount,
    }));

    const weeklyRaw = await this.db.query<{
      day_no: number;
      sales_amount: number;
    }>(
      `
      WITH current_week AS (
        SELECT
          (date_trunc('week', CURRENT_DATE::timestamp) + offs * INTERVAL '1 day')::date AS day_start
        FROM generate_series(0, 6) AS offs
      )
      SELECT
        EXTRACT(ISODOW FROM cw.day_start)::int AS day_no,
        COALESCE(SUM(o.final_total), 0)::double precision AS sales_amount
      FROM current_week cw
      LEFT JOIN orders o
        ON o.created_at >= cw.day_start::timestamp
       AND o.created_at < (cw.day_start::timestamp + INTERVAL '1 day')
      GROUP BY cw.day_start
      ORDER BY cw.day_start
      `
    );

    const dayMeta: Record<number, { day: string; label: string }> = {
      1: { day: "mon", label: "จ." },
      2: { day: "tue", label: "อ." },
      3: { day: "wed", label: "พ." },
      4: { day: "thu", label: "พฤ." },
      5: { day: "fri", label: "ศ." },
      6: { day: "sat", label: "ส." },
      7: { day: "sun", label: "อา." },
    };

    const salesWeekly: SalesWeeklyItem[] = weeklyRaw.rows.map((row) => ({
      day: dayMeta[row.day_no]?.day ?? "unknown",
      label: dayMeta[row.day_no]?.label ?? "-",
      sales_amount: row.sales_amount,
    }));

    const stock = stockResult.rows[0];
    const sales = salesResult.rows[0];
    if (!stock || !sales) {
      throw new Error("Failed to get dashboard summary");
    }

    return {
      total_tree_types: stock.total_tree_types,
      total_trees: stock.total_trees,
      stock_value_sell_price: stock.stock_value_sell_price,
      stock_value_buy_price: stock.stock_value_buy_price,
      stock_profit_value: stock.stock_profit_value,
      total_sales_from_orders: sales.total_sales_from_orders,
      sold_orders_count: ordersResult.rows.length,
      sold_orders: ordersResult.rows,
      top_selling_trees: topSellingTreesResult.rows,
      sales_monthly: salesMonthly,
      sales_weekly: salesWeekly,
    };
  }
}
