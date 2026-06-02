-- 1) 行政区划递归 CTE：加速 pid 子节点展开
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xt_zd_xzjg_pid
ON ayyb.xt_zd_xzjg (pid);
-- 2) yb_cbjl：overall 中按 cbqh + dynd + xzlb 聚合资金
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_cbjl_cbqh_dynd_xzlb
ON ayyb.yb_cbjl (cbqh, dynd, xzlb);
-- 3) yb_cbjl：处理 xzlb=310 且 SUBSTRING(fkssq,1,4)=year 的查询
-- 用表达式索引覆盖年度过滤 + COUNT DISTINCT fkssq 的常见扫描列
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_cbjl_310_cbqh_fkssq_year_fkssq
ON ayyb.yb_cbjl (cbqh, (left(fkssq, 4)), fkssq)
WHERE xzlb = '310';
-- 4) yb_cbjl：处理 xzlb=390 且 dynd=year 的查询
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_cbjl_390_cbqh_dynd
ON ayyb.yb_cbjl (cbqh, dynd)
WHERE xzlb = '390';
-- 5) yb_qyzyjl：住院/外转按 cbqh + yllx + jsrq 区间过滤
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_qyzyjl_cbqh_yllx_jsrq
ON ayyb.yb_qyzyjl (cbqh, yllx, jsrq);
-- 6) yb_qyzyjl：资金进度按 nd + cbqh 过滤
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_qyzyjl_cbqh_nd
ON ayyb.yb_qyzyjl (cbqh, nd);
-- 7) 更新统计信息（让优化器尽快用新索引）
ANALYZE ayyb.xt_zd_xzjg;
ANALYZE ayyb.yb_cbjl;
ANALYZE ayyb.yb_qyzyjl;

-- 1) 医疗集团区划对照表：按区划回查集团（当前主键是 jtbh,qhbh，不利于 qhbh 方向）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_xt_zd_yljt_qhdz_qhbh_jtbh
ON ayyb.xt_zd_yljt_qhdz (qhbh, jtbh);
-- 2) 住院记录：按区划+结算日期范围过滤（medical-groups 核心路径）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_qyzyjl_cbqh_jsrq
ON ayyb.yb_qyzyjl (cbqh, jsrq);
-- 3) 参保记录：按区划+年度过滤（如果你之前没建，这条补上）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_yb_cbjl_cbqh_dynd
ON ayyb.yb_cbjl (cbqh, dynd);
ANALYZE ayyb.xt_zd_yljt_qhdz;
ANALYZE ayyb.yb_qyzyjl;
ANALYZE ayyb.yb_cbjl;