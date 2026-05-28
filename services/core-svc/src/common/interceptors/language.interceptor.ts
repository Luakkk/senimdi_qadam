import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * LanguageInterceptor strips language-specific duplicate fields from the
 * response body based on the lang set by LanguageMiddleware.
 *
 * Example:
 *   Accept-Language: kk
 *   Input:  { titleRu: "Новость", titleKk: "Жаңалық", bodyRu: "...", bodyKk: "..." }
 *   Output: { titleKk: "Жаңалық", bodyKk: "..." }   (Ru fields removed)
 *
 *   Accept-Language: ru (default)
 *   Output: { titleRu: "Новость", bodyRu: "..." }    (Kk fields removed)
 *
 * Works recursively on nested objects and arrays.
 */
@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const lang: 'kk' | 'ru' = req['lang'] ?? 'ru';

    return next.handle().pipe(
      map((data) => this.transform(data, lang)),
    );
  }

  private transform(data: any, lang: 'kk' | 'ru'): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.transform(item, lang));
    }

    if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(data)) {
        // Skip the field for the OTHER language
        if (lang === 'kk' && key.endsWith('Ru') && this.hasPair(data, key, 'Ru', 'Kk')) {
          continue; // drop *Ru when user wants Kazakh
        }
        if (lang === 'ru' && key.endsWith('Kk') && this.hasPair(data, key, 'Kk', 'Ru')) {
          continue; // drop *Kk when user wants Russian
        }

        // Rename: titleKk → title, bodyKk → body (when kk)
        //         titleRu → title, bodyRu → body (when ru)
        const normalised = this.normaliseName(key, lang);
        result[normalised] = this.transform(value, lang);
      }

      return result;
    }

    return data;
  }

  /** Returns true if the object has both the *Ru and *Kk variants of a field */
  private hasPair(obj: any, key: string, from: string, to: string): boolean {
    const base = key.slice(0, -from.length);
    return (base + to) in obj;
  }

  /** Strip language suffix: titleRu → title, bodyKk → body */
  private normaliseName(key: string, lang: 'kk' | 'ru'): string {
    const suffix = lang === 'kk' ? 'Kk' : 'Ru';
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
    return key;
  }
}
