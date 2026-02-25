import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('news')
@Controller('news')
export class NewsController {
  @Get()
  list() {
    return [
      {
        id: 'n1',
        title: 'Открыт новый центр поддержки в Алматы',
        date: '2026-02-26',
        source: 'SenimdiQAdam',
        url: 'https://example.com/news/1',
        summary: 'Коротко: что произошло и чем полезно людям.',
      },
      {
        id: 'n2',
        title: 'Обновлены правила получения соц.услуг',
        date: '2026-02-25',
        source: 'Gov',
        url: 'https://example.com/news/2',
        summary: 'Коротко: что изменилось и куда обращаться.',
      },
    ];
  }
}