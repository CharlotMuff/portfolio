# 作品图片目录
#
# 本目录分为两层：
#
#   assets/img/           原始素材 —— 保持原始 PNG/JPG 格式，不要重命名、
#                         不要覆盖、不要删除。用于留存高分辨率源文件。
#
#   assets/img/optimized/ 展示副本 —— 网站实际加载的图片，由原始素材等比例
#                         缩放生成（最长边 1600px）。PNG 仍为 PNG，
#                         JPG 仍为 JPG。用于控制页面体积与加载速度。
#
# ------------------------------------------------------------------
# 当前 7 件作品对应关系
# ------------------------------------------------------------------
#  序号  作品名称                        分类        原始素材                       展示副本
#  01    湾区明珠·双城海上游             平面设计    游轮.png                       optimized/cruise-poster.png
#  02    匈奴航空·乌兰巴托—深圳          平面设计    乌兰巴托.jpg                   optimized/hunnu-air.jpg
#  03    太阳富国航空产品推介会          平面设计    邀请函.png                     optimized/sun-airways-invitation.png
#  04    2018届优秀毕业设计作品展        平面设计    14级毕业展海报.jpg             optimized/graduation-exhibition-2018.jpg
#  05    2016级毕业设计作品展            平面设计    16级毕业展海报.jpg             optimized/graduation-exhibition-2016.jpg
#  06    短片《返生》                    视频作品    特效短片《返生》封面.jpg       optimized/recovery-cover.jpg
#  07    茶饮产品广告渲染                三维设计    广告渲染图.jpg                 optimized/milk-tea-3d.jpg
#
# ------------------------------------------------------------------
# 新增作品时的步骤
# ------------------------------------------------------------------
# 1. 把原始图片放入本目录（assets/img/）。
# 2. 在 assets/img/optimized/ 中生成等比缩放的展示副本：
#      - 最长边缩放到 1600px，不拉伸、不裁切
#      - PNG 存为 PNG，JPG 存为 JPG（JPEG 质量 85）
#      - 若原图最长边已不超过 1600px，直接复制即可
# 3. 在 index.html 中复制一个 <li class="work-card">，更新：
#      - data-index / data-category
#      - .work__title / .work__cat
#      - .work__media 内的 <img> 路径、alt、width、height
# 4. 若新增了分类，还需在 #work-filters 添加按钮，
#    并在 js/main.js 的 CATEGORY_LABEL 中补充中文名称。
#
# ------------------------------------------------------------------
# 注意事项
# ------------------------------------------------------------------
# - 图片路径必须是相对于项目根目录的路径，例如
#       src="assets/img/optimized/cruise-poster.png"
#   不要写成 "/assets/..."，否则在 GitHub Pages 的 /portfolio/
#   子路径部署下会失效。
# - 所有作品图片使用 object-fit: contain 完整显示，容器留白由深色背景
#   衬托。HTML 中的 width / height 应与展示副本实际像素一致。
# - 首屏以外的作品图片保留 loading="lazy"。
