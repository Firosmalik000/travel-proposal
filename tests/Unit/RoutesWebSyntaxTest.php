<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class RoutesWebSyntaxTest extends TestCase
{
    public function test_routes_web_does_not_break_php_syntax(): void
    {
        $code = file_get_contents(__DIR__.'/../../routes/web.php');

        $this->assertNotFalse($code);
        $this->assertStringNotContainsString('// Get user menus (for sidebar)', $code);

        $tokens = \PhpToken::tokenize($code);

        $depth = 0;

        foreach ($tokens as $token) {
            if ($token->text === '{') {
                $depth++;
            }

            if ($token->text === '}') {
                $depth--;
            }
        }

        $this->assertSame(0, $depth, 'Unbalanced curly braces found in routes/web.php');
    }
}
