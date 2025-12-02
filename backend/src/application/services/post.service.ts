import { IPostRepository } from '../../domain/repositories/post.irepository';
import { Post } from '../../domain/entities/post.entity';
import { CreatePostDto, UpdatePostDto, PostView } from '../dtos/post.dto';
import { Pagination } from '../dtos/pagination.dto';
import { SortOption } from '../dtos/sort-option.dto';
import { ListResult } from '../dtos/list-result.dto';

export class PostService {
  constructor(private readonly postRepo: IPostRepository) {}

  // ================= Core CRUD =================
  async createPost(data: CreatePostDto): Promise<Post> {
    return this.postRepo.create(data);
  }

  async getPostById(id: string): Promise<Post> {
    return this.postRepo.findById(id);
  }

  async updatePost(id: string, changes: UpdatePostDto): Promise<Post> {
    return this.postRepo.update(id, changes);
  }

  async softDeletePost(id: string): Promise<void> {
    return this.postRepo.softDelete(id);
  }

  async restorePost(id: string): Promise<void> {
    return this.postRepo.restore(id);
  }

  // ================= Public Views =================
  async getPostsByEvent(
    eventId: string,
    pagination?: Pagination,
    sort?: SortOption
  ): Promise<ListResult<PostView>> {
    return this.postRepo.findByEventId(eventId, pagination, sort);
  }

  async getPostsByAuthor(
    authorId: string,
    pagination?: Pagination,
    sort?: SortOption
  ): Promise<ListResult<PostView>> {
    return this.postRepo.findByAuthor(authorId, pagination, sort);
  }

  async searchPosts(
    eventId: string,
    keyword: string,
    pagination?: Pagination,
    sort?: SortOption
  ): Promise<ListResult<PostView>> {
    return this.postRepo.search(eventId, keyword, pagination, sort);
  }

  // ================= Stats =================
  async countPostsByEvent(eventId: string): Promise<number> {
    return this.postRepo.countByEventId(eventId);
  }

  async countPostsByUser(userId: string): Promise<number> {
    return this.postRepo.countByUserId(userId);
  }
}
