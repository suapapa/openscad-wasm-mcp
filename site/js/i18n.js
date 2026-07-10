const SUPPORTED = ["en", "ko", "ja", "zh", "pl"];
const STORAGE_KEY = "openscad-wasm-mcp-lang";

const translations = {
  en: {
    "meta.title": "openscad-wasm-mcp: OpenSCAD for AI agents",
    "meta.description":
      "MCP server that runs OpenSCAD through WebAssembly. Generate, preview, and export 3D models from AI agents without a native OpenSCAD install.",
    "nav.github": "GitHub",
    "nav.docs": "Docs",
    "nav.flow": "Flow",
    "nav.tools": "Tools",
    "nav.start": "Start",
    "lang.label": "Language",
    "hero.brand": "openscad-wasm-mcp",
    "hero.headline": "OpenSCAD for AI agents, no native install",
    "hero.lead":
      "An MCP server that runs OpenSCAD through WebAssembly in Node.js. Ask an agent for a model, get a preview link and printable STL.",
    "hero.cta.primary": "View on GitHub",
    "hero.cta.secondary": "See how it works",
    "hero.image.alt": "Cute low-poly rabbit model open in OpenSCAD",
    "flow.kicker": "From prompt to print",
    "flow.title": "One conversation, a printable model",
    "flow.lead":
      "Connect the server to an MCP client, describe what you want, and walk the result from chat to slicer.",
    "flow.1.title": "Ask the agent",
    "flow.1.body":
      "Describe a part in natural language. The agent writes OpenSCAD and calls the MCP tools.",
    "flow.1.alt": "Hermes Agent chat creating a 3D rabbit model",
    "flow.2.title": "Preview in the browser",
    "flow.2.body":
      "Interactive STL viewer links let you rotate and zoom before you download.",
    "flow.2.alt": "Interactive 3D preview of an exported STL model",
    "flow.3.title": "Open the SCAD source",
    "flow.3.body":
      "Download the generated .scad and open it in desktop OpenSCAD.",
    "flow.3.alt": "Generated SCAD source and preview in OpenSCAD",
    "flow.4.title": "Slice and print",
    "flow.4.body":
      "Download the STL directly and load it in your slicer.",
    "flow.4.alt": "Exported STL loaded in PrusaSlicer for 3D printing",
    "why.kicker": "Why this server",
    "why.title": "WASM OpenSCAD, MCP-shaped",
    "why.lead":
      "Built for agents that need real geometry tools, not screenshots of a CAD UI.",
    "why.1.title": "No host OpenSCAD binary",
    "why.1.body":
      "Runs openscad-wasm in Node.js. Docker Compose is enough to start.",
    "why.2.title": "Allowlisted tool surface",
    "why.2.body":
      "Validate, export, preview, analyze, and manage workspace files. No shell, no raw CLI args.",
    "why.3.title": "Preview links built in",
    "why.3.body":
      "Opaque tokens serve an interactive Three.js viewer from the same HTTP server.",
    "why.4.title": "Hardened by default",
    "why.4.body":
      "Path safety, size limits, timeouts, concurrency caps, and a locked-down Compose setup.",
    "tools.kicker": "MCP tools",
    "tools.title": "What agents can call",
    "tools.lead": "Structured tools with Zod-validated inputs and artifact metadata in responses.",
    "tools.validate": "Validate SCAD and return diagnostics",
    "tools.export": "Export stl, 3mf, off, csg, dxf, or svg",
    "tools.preview": "Interactive 3D preview link or WebP mesh preview",
    "tools.link": "Create a browser STL viewer link",
    "tools.analyze": "Bounding box and triangle count from STL",
    "tools.workspace": "List, read, write, and delete workspace files",
    "start.kicker": "Quick start",
    "start.title": "Up in one Compose command",
    "start.lead":
      "The service listens on http://127.0.0.1:3333/mcp. Point your MCP client at that URL.",
    "start.copy": "Copy",
    "start.copied": "Copied",
    "start.copy.fallback": "Select and copy manually",
    "start.note":
      "Optional MCP_AUTH_TOKEN protects /mcp with a Bearer token. See the README for Hermes and other clients.",
    "cta.title": "Build models with your agent",
    "cta.body":
      "Clone the repo, start Compose, and connect an MCP client. MIT-licensed project source.",
    "cta.button": "Open repository",
    "footer.license": "Project source: MIT. Runtime dependencies have their own licenses.",
    "footer.repo": "suapapa/openscad-wasm-mcp",
  },
  ko: {
    "meta.title": "openscad-wasm-mcp: AI 에이전트를 위한 OpenSCAD",
    "meta.description":
      "WebAssembly로 OpenSCAD를 돌리는 MCP 서버. AI 에이전트에서 3D 모델을 만들고 미리보고 내보냅니다. 네이티브 OpenSCAD 설치는 필요 없습니다.",
    "nav.github": "GitHub",
    "nav.docs": "문서",
    "nav.flow": "흐름",
    "nav.tools": "도구",
    "nav.start": "시작",
    "lang.label": "언어",
    "hero.brand": "openscad-wasm-mcp",
    "hero.headline": "AI 에이전트를 위한 OpenSCAD, 네이티브 설치 없이",
    "hero.lead":
      "Node.js에서 WebAssembly로 OpenSCAD를 돌리는 MCP 서버입니다. 에이전트에게 모델을 요청하면 미리보기 링크와 출력용 STL이 돌아옵니다.",
    "hero.cta.primary": "GitHub에서 보기",
    "hero.cta.secondary": "동작 방식 보기",
    "hero.image.alt": "OpenSCAD에서 연 귀여운 로우폴리 토끼 모델",
    "flow.kicker": "프롬프트에서 출력까지",
    "flow.title": "대화 한 번으로 출력 가능한 모델",
    "flow.lead":
      "MCP 클라이언트에 서버를 연결하고 원하는 형태를 설명하면 채팅에서 슬라이서까지 이어집니다.",
    "flow.1.title": "에이전트에게 요청",
    "flow.1.body":
      "자연어로 부품을 설명하세요. 에이전트가 OpenSCAD를 쓰고 MCP 도구를 호출합니다.",
    "flow.1.alt": "Hermes Agent 채팅에서 3D 토끼 모델을 만드는 화면",
    "flow.2.title": "브라우저에서 미리보기",
    "flow.2.body":
      "인터랙티브 STL 뷰어 링크로 받기 전에 돌려보고 확대해 보세요.",
    "flow.2.alt": "내보낸 STL 모델의 인터랙티브 3D 미리보기",
    "flow.3.title": "SCAD 소스 열기",
    "flow.3.body":
      "생성된 .scad는 다운로드 받아 데스크톱 OpenSCAD에서 열면 됩니다.",
    "flow.3.alt": "OpenSCAD에서 본 생성된 SCAD 소스와 미리보기",
    "flow.4.title": "슬라이스 후 출력",
    "flow.4.body":
      "STL을 바로 다운로드 받아 슬라이서에서 불러올 수 있습니다.",
    "flow.4.alt": "3D 출력을 위해 PrusaSlicer에 불러온 STL",
    "why.kicker": "이 서버를 쓰는 이유",
    "why.title": "WASM OpenSCAD, MCP에 맞게",
    "why.lead":
      "CAD UI 스크린샷이 아니라 실제 지오메트리 도구가 필요한 에이전트를 위해 만들었습니다.",
    "why.1.title": "호스트 OpenSCAD 바이너리 불필요",
    "why.1.body":
      "Node.js에서 openscad-wasm을 실행합니다. Docker Compose만 있으면 됩니다.",
    "why.2.title": "허용된 도구만 노출",
    "why.2.body":
      "검증·내보내기·미리보기·분석·워크스페이스 파일 관리. 셸 실행과 임의 CLI 인자는 없습니다.",
    "why.3.title": "미리보기 링크 내장",
    "why.3.body":
      "경로를 드러내지 않는 토큰으로 같은 HTTP 서버에서 Three.js 뷰어를 띄웁니다.",
    "why.4.title": "처음부터 잠근 보안",
    "why.4.body":
      "경로 검사, 크기·시간·동시성 제한, 잠근 Compose 설정을 기본으로 둡니다.",
    "tools.kicker": "MCP 도구",
    "tools.title": "에이전트가 호출하는 기능",
    "tools.lead": "Zod로 입력을 검증하고 응답에 아티팩트 메타데이터를 넣습니다.",
    "tools.validate": "SCAD 검증 후 진단 반환",
    "tools.export": "stl, 3mf, off, csg, dxf, svg 내보내기",
    "tools.preview": "인터랙티브 3D 미리보기 링크 또는 WebP 메시 미리보기",
    "tools.link": "브라우저 STL 뷰어 링크 만들기",
    "tools.analyze": "STL에서 바운딩 박스와 삼각형 수 계산",
    "tools.workspace": "워크스페이스 파일 목록·읽기·쓰기·삭제",
    "start.kicker": "빠른 시작",
    "start.title": "Compose 한 줄로 실행",
    "start.lead":
      "서비스는 http://127.0.0.1:3333/mcp 에서 열려 있습니다. MCP 클라이언트를 이 URL로 연결하세요.",
    "start.copy": "복사",
    "start.copied": "복사됨",
    "start.copy.fallback": "직접 선택해 복사하세요",
    "start.note":
      "MCP_AUTH_TOKEN을 넣으면 /mcp를 Bearer 토큰으로 막을 수 있습니다. Hermes 등 클라이언트 설정은 README를 보세요.",
    "cta.title": "에이전트로 모델을 만드세요",
    "cta.body":
      "저장소를 클론하고 Compose를 띄운 뒤 MCP 클라이언트를 연결하세요. 프로젝트 소스는 MIT 라이선스입니다.",
    "cta.button": "저장소 열기",
    "footer.license": "프로젝트 소스: MIT. 런타임 의존성은 각 라이선스를 따릅니다.",
    "footer.repo": "suapapa/openscad-wasm-mcp",
  },
  ja: {
    "meta.title": "openscad-wasm-mcp: AIエージェント向け OpenSCAD",
    "meta.description":
      "WebAssemblyでOpenSCADを実行するMCPサーバー。AIエージェントから3Dモデルの生成・プレビュー・書き出し。ネイティブOpenSCADのインストールは不要です。",
    "nav.github": "GitHub",
    "nav.docs": "ドキュメント",
    "nav.flow": "流れ",
    "nav.tools": "ツール",
    "nav.start": "開始",
    "lang.label": "言語",
    "hero.brand": "openscad-wasm-mcp",
    "hero.headline": "AIエージェント向け OpenSCAD。ネイティブ不要",
    "hero.lead":
      "Node.js上でWebAssembly版OpenSCADを動かすMCPサーバーです。エージェントにモデルを頼めば、プレビューリンクと印刷用STLが返ります。",
    "hero.cta.primary": "GitHubで見る",
    "hero.cta.secondary": "仕組みを見る",
    "hero.image.alt": "OpenSCADで開いたかわいいローポリうさぎモデル",
    "flow.kicker": "プロンプトから印刷まで",
    "flow.title": "会話ひとつで印刷可能なモデルへ",
    "flow.lead":
      "MCPクライアントにサーバーを接続し、欲しい形を伝えるだけ。チャットからスライサーまでつながります。",
    "flow.1.title": "エージェントに依頼",
    "flow.1.body":
      "自然言語で部品を説明します。エージェントがOpenSCADを書き、MCPツールを呼び出します。",
    "flow.1.alt": "Hermes Agentのチャットで3Dうさぎモデルを作成する画面",
    "flow.2.title": "ブラウザでプレビュー",
    "flow.2.body":
      "インタラクティブなSTLビューアリンクで、ダウンロード前に回転・ズームできます。",
    "flow.2.alt": "書き出したSTLモデルのインタラクティブ3Dプレビュー",
    "flow.3.title": "SCADソースを開く",
    "flow.3.body":
      "生成された.scadをダウンロードし、デスクトップOpenSCADで開けます。",
    "flow.3.alt": "OpenSCADで表示した生成SCADソースとプレビュー",
    "flow.4.title": "スライスして印刷",
    "flow.4.body":
      "STLをそのままダウンロードして、スライサーに読み込めます。",
    "flow.4.alt": "3D印刷のためPrusaSlicerに読み込んだSTL",
    "why.kicker": "このサーバーを選ぶ理由",
    "why.title": "WASM OpenSCADを、MCPのかたちで",
    "why.lead":
      "CAD UIのスクリーンショットではなく、本物のジオメトリツールが必要なエージェント向けです。",
    "why.1.title": "ホストにOpenSCADバイナリ不要",
    "why.1.body":
      "Node.jsでopenscad-wasmを実行します。Docker Composeだけで始められます。",
    "why.2.title": "許可リストのツール面",
    "why.2.body":
      "検証・書き出し・プレビュー・解析・ワークスペース管理。シェル実行も生のCLI引数もありません。",
    "why.3.title": "プレビューリンク内蔵",
    "why.3.body":
      "不透明トークンで、同じHTTPサーバーからThree.jsインタラクティブビューアを提供します。",
    "why.4.title": "最初から堅牢",
    "why.4.body":
      "パス安全性、サイズ制限、タイムアウト、同時実行上限、ロックダウンしたCompose構成が標準です。",
    "tools.kicker": "MCPツール",
    "tools.title": "エージェントが呼べる機能",
    "tools.lead": "Zodで入力を検証し、応答に成果物メタデータを含めます。",
    "tools.validate": "SCAD検証と診断の返却",
    "tools.export": "stl / 3mf / off / csg / dxf / svg の書き出し",
    "tools.preview": "インタラクティブ3Dプレビューリンク、またはWebPメッシュプレビュー",
    "tools.link": "ブラウザSTLビューアリンクの作成",
    "tools.analyze": "STLからバウンディングボックスと三角形数を算出",
    "tools.workspace": "ワークスペースファイルの一覧・読取・書込・削除",
    "start.kicker": "クイックスタート",
    "start.title": "Compose一発で起動",
    "start.lead":
      "サービスは http://127.0.0.1:3333/mcp で待ち受けます。MCPクライアントをこのURLに向けてください。",
    "start.copy": "コピー",
    "start.copied": "コピー済み",
    "start.copy.fallback": "手動で選択してコピーしてください",
    "start.note":
      "任意のMCP_AUTH_TOKENで /mcp をBearerトークン保護できます。Hermesなどクライアント設定はREADMEを参照してください。",
    "cta.title": "エージェントでモデルを作る",
    "cta.body":
      "リポジトリをクローンし、Composeを起動してMCPクライアントを接続してください。プロジェクトソースはMITライセンスです。",
    "cta.button": "リポジトリを開く",
    "footer.license": "プロジェクトソース: MIT。ランタイム依存関係は各ライセンスに従います。",
    "footer.repo": "suapapa/openscad-wasm-mcp",
  },
  zh: {
    "meta.title": "openscad-wasm-mcp: 面向 AI 智能体的 OpenSCAD",
    "meta.description":
      "通过 WebAssembly 运行 OpenSCAD 的 MCP 服务器。让 AI 智能体生成、预览并导出 3D 模型，无需安装原生 OpenSCAD。",
    "nav.github": "GitHub",
    "nav.docs": "文档",
    "nav.flow": "流程",
    "nav.tools": "工具",
    "nav.start": "开始",
    "lang.label": "语言",
    "hero.brand": "openscad-wasm-mcp",
    "hero.headline": "面向 AI 智能体的 OpenSCAD，无需原生安装",
    "hero.lead":
      "在 Node.js 中通过 WebAssembly 运行 OpenSCAD 的 MCP 服务器。向智能体描述模型，即可获得预览链接和可打印的 STL。",
    "hero.cta.primary": "在 GitHub 查看",
    "hero.cta.secondary": "了解工作方式",
    "hero.image.alt": "在 OpenSCAD 中打开的可爱低多边形兔子模型",
    "flow.kicker": "从提示到打印",
    "flow.title": "一次对话，得到可打印模型",
    "flow.lead":
      "将服务器连接到 MCP 客户端，描述你想要的形状，从聊天一路走到切片软件。",
    "flow.1.title": "向智能体提问",
    "flow.1.body":
      "用自然语言描述零件。智能体编写 OpenSCAD 并调用 MCP 工具。",
    "flow.1.alt": "Hermes Agent 聊天中创建 3D 兔子模型的界面",
    "flow.2.title": "在浏览器中预览",
    "flow.2.body":
      "交互式 STL 查看器链接可在下载前旋转、缩放查看模型。",
    "flow.2.alt": "已导出 STL 模型的交互式 3D 预览",
    "flow.3.title": "打开 SCAD 源文件",
    "flow.3.body":
      "下载生成的 .scad，并在桌面版 OpenSCAD 中打开。",
    "flow.3.alt": "在 OpenSCAD 中查看生成的 SCAD 源码与预览",
    "flow.4.title": "切片并打印",
    "flow.4.body":
      "可直接下载 STL，并在切片软件中打开。",
    "flow.4.alt": "为 3D 打印而加载到 PrusaSlicer 中的 STL",
    "why.kicker": "为什么选择此服务器",
    "why.title": "WASM OpenSCAD，按 MCP 形态打造",
    "why.lead":
      "为需要真实几何工具的智能体而建，而不是 CAD 界面的截图。",
    "why.1.title": "主机无需 OpenSCAD 二进制",
    "why.1.body":
      "在 Node.js 中运行 openscad-wasm。用 Docker Compose 即可启动。",
    "why.2.title": "白名单工具面",
    "why.2.body":
      "验证、导出、预览、分析与工作区文件管理。无 shell，无原始 CLI 参数。",
    "why.3.title": "内置预览链接",
    "why.3.body":
      "通过不透明令牌，在同一 HTTP 服务器上提供 Three.js 交互式查看器。",
    "why.4.title": "默认加固",
    "why.4.body":
      "路径安全、大小限制、超时、并发上限，以及锁定的 Compose 配置。",
    "tools.kicker": "MCP 工具",
    "tools.title": "智能体可调用的功能",
    "tools.lead": "使用 Zod 校验输入，并在响应中包含产物元数据。",
    "tools.validate": "验证 SCAD 并返回诊断信息",
    "tools.export": "导出 stl、3mf、off、csg、dxf 或 svg",
    "tools.preview": "交互式 3D 预览链接或 WebP 网格预览",
    "tools.link": "创建浏览器 STL 查看器链接",
    "tools.analyze": "从 STL 计算包围盒与三角形数量",
    "tools.workspace": "列出、读取、写入与删除工作区文件",
    "start.kicker": "快速开始",
    "start.title": "一条 Compose 命令即可启动",
    "start.lead":
      "服务监听 http://127.0.0.1:3333/mcp。将 MCP 客户端指向该 URL。",
    "start.copy": "复制",
    "start.copied": "已复制",
    "start.copy.fallback": "请手动选择并复制",
    "start.note":
      "可选的 MCP_AUTH_TOKEN 可用 Bearer 令牌保护 /mcp。Hermes 等客户端配置见 README。",
    "cta.title": "用智能体构建模型",
    "cta.body":
      "克隆仓库，启动 Compose，并连接 MCP 客户端。项目源码采用 MIT 许可。",
    "cta.button": "打开仓库",
    "footer.license": "项目源码：MIT。运行时依赖遵循各自许可。",
    "footer.repo": "suapapa/openscad-wasm-mcp",
  },
  pl: {
    "meta.title": "openscad-wasm-mcp: OpenSCAD dla agentów AI",
    "meta.description":
      "Serwer MCP uruchamiający OpenSCAD przez WebAssembly. Generuj, podglądaj i eksportuj modele 3D z agentów AI, bez instalacji natywnego OpenSCAD.",
    "nav.github": "GitHub",
    "nav.docs": "Dokumentacja",
    "nav.flow": "Przepływ",
    "nav.tools": "Narzędzia",
    "nav.start": "Start",
    "lang.label": "Język",
    "hero.brand": "openscad-wasm-mcp",
    "hero.headline": "OpenSCAD dla agentów AI, bez natywnej instalacji",
    "hero.lead":
      "Serwer MCP, który uruchamia OpenSCAD przez WebAssembly w Node.js. Poproś agenta o model, a dostaniesz link do podglądu i drukowalny STL.",
    "hero.cta.primary": "Zobacz na GitHubie",
    "hero.cta.secondary": "Zobacz, jak działa",
    "hero.image.alt": "Uroczy low-poly model królika otwarty w OpenSCAD",
    "flow.kicker": "Od promptu do druku",
    "flow.title": "Jedna rozmowa, drukowalny model",
    "flow.lead":
      "Podłącz serwer do klienta MCP, opisz, czego potrzebujesz, i przejdź od czatu do slicera.",
    "flow.1.title": "Poproś agenta",
    "flow.1.body":
      "Opisz część językiem naturalnym. Agent napisze OpenSCAD i wywoła narzędzia MCP.",
    "flow.1.alt": "Czat Hermes Agent tworzący model 3D królika",
    "flow.2.title": "Podgląd w przeglądarce",
    "flow.2.body":
      "Interaktywne linki do przeglądarki STL pozwalają obracać i powiększać przed pobraniem.",
    "flow.2.alt": "Interaktywny podgląd 3D wyeksportowanego modelu STL",
    "flow.3.title": "Otwórz źródło SCAD",
    "flow.3.body":
      "Pobierz wygenerowany plik .scad i otwórz go w desktopowym OpenSCAD.",
    "flow.3.alt": "Wygenerowane źródło SCAD i podgląd w OpenSCAD",
    "flow.4.title": "Pokrój i drukuj",
    "flow.4.body":
      "Pobierz STL bezpośrednio i wczytaj go w slicerze.",
    "flow.4.alt": "Wyeksportowany STL wczytany w PrusaSlicer do druku 3D",
    "why.kicker": "Dlaczego ten serwer",
    "why.title": "WASM OpenSCAD w kształcie MCP",
    "why.lead":
      "Zbudowany dla agentów, które potrzebują prawdziwych narzędzi geometrii, nie zrzutów ekranu UI CAD.",
    "why.1.title": "Bez binarki OpenSCAD na hoście",
    "why.1.body":
      "Uruchamia openscad-wasm w Node.js. Wystarczy Docker Compose, by zacząć.",
    "why.2.title": "Powierzchnia narzędzi na białej liście",
    "why.2.body":
      "Walidacja, eksport, podgląd, analiza i pliki workspace. Bez shella i surowych argumentów CLI.",
    "why.3.title": "Wbudowane linki podglądu",
    "why.3.body":
      "Nieprzezroczyste tokeny serwują interaktywny podgląd Three.js z tego samego serwera HTTP.",
    "why.4.title": "Domyślnie utwardzony",
    "why.4.body":
      "Bezpieczeństwo ścieżek, limity rozmiaru, timeouty, limity współbieżności i zablokowana konfiguracja Compose.",
    "tools.kicker": "Narzędzia MCP",
    "tools.title": "Co mogą wywołać agenci",
    "tools.lead":
      "Ustrukturyzowane narzędzia z walidacją Zod i metadanymi artefaktów w odpowiedziach.",
    "tools.validate": "Waliduj SCAD i zwróć diagnostykę",
    "tools.export": "Eksportuj stl, 3mf, off, csg, dxf lub svg",
    "tools.preview": "Interaktywny link podglądu 3D lub podgląd siatki WebP",
    "tools.link": "Utwórz link przeglądarki STL",
    "tools.analyze": "Bounding box i liczba trójkątów ze STL",
    "tools.workspace": "Listuj, czytaj, zapisuj i usuwaj pliki workspace",
    "start.kicker": "Szybki start",
    "start.title": "Gotowe jedną komendą Compose",
    "start.lead":
      "Usługa nasłuchuje na http://127.0.0.1:3333/mcp. Skieruj klienta MCP na ten URL.",
    "start.copy": "Kopiuj",
    "start.copied": "Skopiowano",
    "start.copy.fallback": "Zaznacz i skopiuj ręcznie",
    "start.note":
      "Opcjonalny MCP_AUTH_TOKEN chroni /mcp tokenem Bearer. Konfiguracja Hermesa i innych klientów: w README.",
    "cta.title": "Buduj modele z agentem",
    "cta.body":
      "Sklonuj repozytorium, uruchom Compose i podłącz klienta MCP. Kod projektu na licencji MIT.",
    "cta.button": "Otwórz repozytorium",
    "footer.license":
      "Kod projektu: MIT. Zależności runtime mają własne licencje.",
    "footer.repo": "suapapa/openscad-wasm-mcp",
  },
};

function normalizeLang(raw) {
  if (!raw) return null;
  const lower = String(raw).toLowerCase().replaceAll("_", "-");
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("pl")) return "pl";
  if (lower.startsWith("en")) return "en";
  return null;
}

function detectLang() {
  try {
    const fromQuery = normalizeLang(new URLSearchParams(location.search).get("lang"));
    if (fromQuery) return fromQuery;
  } catch {
    /* ignore */
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const fromStore = normalizeLang(stored);
    if (fromStore) return fromStore;
  } catch {
    /* ignore */
  }

  const candidates = [];
  if (Array.isArray(navigator.languages)) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) candidates.push(navigator.language);

  for (const candidate of candidates) {
    const matched = normalizeLang(candidate);
    if (matched) return matched;
  }
  return "en";
}

let currentLang = "en";

function t(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

const CJK_FONTS = {
  ko: "Noto+Sans+KR:wght@400;500;700",
  ja: "Noto+Sans+JP:wght@400;500;700",
  zh: "Noto+Sans+SC:wght@400;500;700",
};

function ensureCjkFont(lang) {
  const family = CJK_FONTS[lang];
  const existing = document.getElementById("font-cjk");
  if (!family) {
    existing?.remove();
    return;
  }
  const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  if (existing) {
    if (existing.getAttribute("href") !== href) existing.setAttribute("href", href);
    return;
  }
  const link = document.createElement("link");
  link.id = "font-cjk";
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function applyTranslations(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  ensureCjkFont(lang);

  document.title = t(lang, "meta.title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t(lang, "meta.description"));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(lang, key);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    if (!key) return;
    el.setAttribute("alt", t(lang, key));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (!key) return;
    el.setAttribute("aria-label", t(lang, key));
  });

  const langSelect = document.getElementById("lang-select");
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }
}

function setLang(lang, { persist = true, syncUrl = true } = {}) {
  const next = SUPPORTED.includes(lang) ? lang : "en";
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }
  if (syncUrl) {
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", next);
      history.replaceState({}, "", url);
    } catch {
      /* ignore */
    }
  }
  applyTranslations(next);
  return next;
}

function getLang() {
  return currentLang;
}

export { SUPPORTED, detectLang, setLang, t, applyTranslations, getLang };
