// ArticleSummary.js
class ArticleSummary {
    constructor(container, options = {}) {
        // 检查是否启用摘要功能
        if (!articleConfig.enableSummary) {
            return;
        }

        // 检查当前URL是否在黑名单中
        if (this.shouldHideSummary()) {
            return;
        }

        // 检查当前URL是否符合配置的模式
        if (!this.shouldShowSummary()) {
            return;
        }

        this.container = container;
        this.options = {
            icon: options.icon || './icon.svg',
            title: options.title || '文章摘要',
            content: this.cleanContent(options.content) || '',
            source: options.source || 'SummaraidGPT',
            theme: options.theme || 'default'
        };
        this.options.theme = this.detectDarkMode() ? 'dark' : (options.theme || 'default');
        if (articleConfig.darkModeSelector) {
            this.observeDarkMode();
        }
        this.render();
        this.logMessage(); // 添加控制台日志输出
    }

    // 控制台日志输出
    logMessage() {
        console.log(`\n %c 智阅GPT-智能AI摘要 %c https://www.lik.cc/ \n`,
            'color: #fadfa3; background: #030307; padding:5px 0;',
            'background: #fadfa3; padding:5px 0;');
    }

    // 检查是否在黑名单中
    shouldHideSummary() {
        const currentUrl = window.location.href;
        return articleConfig.blacklist.includes(currentUrl);
    }

    // 检查当前URL是否符合配置的模式
    shouldShowSummary() {
        const currentPath = window.location.pathname;
        return articleConfig.urlPatterns.some(pattern => {
            // 处理以 * 开头的模式
            if (pattern.startsWith('*')) {
                pattern = pattern.substring(1); // 移除开头的 *
            }
            // 处理以 * 结尾的模式
            if (pattern.endsWith('*')) {
                pattern = pattern.slice(0, -1); // 移除结尾的 *
            }

            // 将剩余的 * 转换为正则表达式的 .*
            pattern = pattern.replace(/\*/g, '.*');

            // 如果模式不以 / 开头，添加 /
            if (!pattern.startsWith('/')) {
                pattern = '/' + pattern;
            }

            // 创建正则表达式
            const regex = new RegExp(pattern);
            return regex.test(currentPath);
        });
    }

    cleanContent(content) {
        // 去除多余的空白行
        return content.replace(/\n\s*\n/g, '\n').trim();
    }

    render() {
        if (!this.container) return;  // 如果不需要显示，直接返回

        const summaryHtml = `
            <div class="post-SummaraidGPT gpttheme_${this.options.theme}">
                <div class="SummaraidGPT-title">
                    <div class="SummaraidGPT-title-icon">
                        <img src="${this.options.icon}" alt="图标" style="width: 24px; height: 24px;">
                    </div>
                    <div class="SummaraidGPT-title-text">${this.options.title}</div>
                    <div id="SummaraidGPT-tag">${this.options.source}</div>
                </div>
                <div class="SummaraidGPT-explanation">
                    <p id="typing-text"></p>
                </div>
            </div>
        `;

        // 使用 innerHTML 插入摘要
        this.container.innerHTML = summaryHtml + this.container.innerHTML;
        this.typeText(this.options.content);
    }
// 检测暗色主题
    detectDarkMode() {
        if (!articleConfig.darkModeSelector) {
            return false;
        }

        try {
            const selector = articleConfig.darkModeSelector.trim();
            if (!selector) return false;

            if (selector.includes('=')) {
                const [attr, value] = selector.split('=').map(s => s.trim());
                const cleanValue = value.replace(/['"]/g, '');
                return document.documentElement.getAttribute(attr) === cleanValue;
            } else {
                return document.documentElement.hasAttribute(selector);
            }
        } catch (error) {
            console.error('Dark mode detection error:', error);
            return false;
        }
    }

// 监听主题变化
    observeDarkMode() {
        try {
            const selector = articleConfig.darkModeSelector.trim();
            if (!selector) return;

            const attributeName = selector.includes('=')
                    ? selector.split('=')[0].trim()
                    : selector;

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' &&
                            mutation.attributeName === attributeName) {
                        const isDark = this.detectDarkMode();
                        this.updateTheme(isDark ? 'dark' : 'default');
                    }
                });
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: [attributeName]
            });
        } catch (error) {
            console.error('Dark mode observer error:', error);
        }
    }

// 更新主题
    updateTheme(theme) {
        if (this.options.theme !== theme) {
            this.options.theme = theme;
            const container = document.querySelector('.post-SummaraidGPT');
            if (container) {
                container.style.transition = 'background-color 0.3s, color 0.3s';
                container.className = `post-SummaraidGPT gpttheme_${theme}`;
            }
        }
    }
    // 打字机效果函数
    typeText(text) {
        const typingTextElement = document.getElementById('typing-text');
        typingTextElement.innerHTML = '';
        let index = 0;
        const typingSpeed = 50;
        const cursorElement = document.createElement('span');
        cursorElement.innerHTML = '|';
        cursorElement.style.animation = 'blink 0.7s step-end infinite';

        // 添加光标淡出动画样式
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.innerHTML = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            .cursor-fadeout {
                animation: fadeOut 0.5s forwards;
            }
        `;
        document.head.appendChild(fadeOutStyle);

        const type = () => {
            if (index <= text.length) {
                const currentText = text.slice(0, index);
                typingTextElement.innerHTML = currentText;
                typingTextElement.appendChild(cursorElement);

                if (index === text.length) {
                    // 添加淡出动画后移除光标
                    setTimeout(() => {
                        cursorElement.classList.add('cursor-fadeout');
                        setTimeout(() => {
                            cursorElement.remove();
                            fadeOutStyle.remove();  // 清理动画样式
                        }, 500);
                    }, 500);
                } else {
                    index++;
                    const randomDelay = typingSpeed + Math.random() * 50;
                    setTimeout(type, randomDelay);
                }
            }
        };
        type();
    }

    updateContent(content) {
        this.options.content = this.cleanContent(content);
        this.render();
    }
}

// 确保在 DOM 加载后初始化组件
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector(articleConfig.container);
    const summary = new ArticleSummary(container, {
        icon: articleConfig.content.icon,
        title: articleConfig.content.title,
        content: articleConfig.content.text,
        source: articleConfig.content.source,
        theme: articleConfig.theme
    });

    // 导出实例到全局作用域（方便调试和扩展）
    window.articleSummary = summary;
});

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArticleSummary;
}

// 添加光标闪烁的 CSS 动画
const style = document.createElement('style');
style.innerHTML = `
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}`;
document.head.appendChild(style); 
